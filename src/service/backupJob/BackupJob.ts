import { DateFormats, Dates } from "@openforis/arena-core";
import { JobMobile, JobMobileContext } from "model";
import { Files } from "utils";

import { OfflineMapTilesStorage } from "../offlineMaps/offlineMapTilesStorage";

const outputFileNamePrefix = `arena_mobile_full_backup_`;

type BackupJobContext = JobMobileContext & {
  outputFileUri?: string;
};

export class BackupJob extends JobMobile<BackupJobContext> {
  override async execute() {
    await super.onStart();

    const timestamp = Dates.format(new Date(), DateFormats.datetimeDefault);
    const outputFileName = `${outputFileNamePrefix}${timestamp}.zip`;

    const outputFileUri = Files.path(Files.cacheDirectory, outputFileName);

    // offline map tiles can be downloaded again and would make the backup huge:
    // move them temporarily outside of the backed up folder
    const mapTilesDirUri = OfflineMapTilesStorage.getTilesRootDirUri();
    const mapTilesTempDirUri = Files.path(
      Files.cacheDirectory,
      `map_tiles_backup_${Date.now()}`,
    );
    const mapTilesMoved = await Files.exists(mapTilesDirUri);
    if (mapTilesMoved) {
      await Files.moveFile({ from: mapTilesDirUri, to: mapTilesTempDirUri });
    }
    try {
      await Files.zip(Files.documentDirectory, outputFileUri);
    } finally {
      if (mapTilesMoved) {
        await Files.moveFile({ from: mapTilesTempDirUri, to: mapTilesDirUri });
      }
    }

    this.context.outputFileUri = outputFileUri;
  }

  override async generateResult() {
    const { outputFileUri } = this.context;
    return { outputFileUri };
  }
}
