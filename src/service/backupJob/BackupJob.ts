import { DateFormats, Dates } from "@openforis/arena-core";
import { JobMobile, JobMobileContext } from "model";
import { Files } from "utils";

import { OfflineMapTilesStorage } from "../offlineMaps/offlineMapTilesStorage";
import { PdfMapsStorage } from "../pdfMaps/pdfMapsStorage";

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

    // map files would make the backup huge: offline map tiles can be downloaded again and
    // PDF maps imported again; move them temporarily outside of the backed up folder
    const dirUris = [
      OfflineMapTilesStorage.getTilesRootDirUri(),
      PdfMapsStorage.getRootDirUri(),
    ];
    const existing = await Promise.all(dirUris.map((uri) => Files.exists(uri)));
    const moveTimestamp = Date.now();
    const excludedDirs = dirUris
      .map((uri, index) => ({
        uri,
        tempUri: Files.path(
          Files.cacheDirectory,
          `map_files_backup_${moveTimestamp}_${index}`,
        ),
      }))
      .filter((_, index) => existing[index]);
    await Promise.all(
      excludedDirs.map(({ uri, tempUri }) =>
        Files.moveFile({ from: uri, to: tempUri }),
      ),
    );
    try {
      await Files.zip(Files.documentDirectory, outputFileUri);
    } finally {
      await Promise.all(
        excludedDirs.map(({ uri, tempUri }) =>
          Files.moveFile({ from: tempUri, to: uri }),
        ),
      );
    }

    this.context.outputFileUri = outputFileUri;
  }

  override generateResult() {
    const { outputFileUri } = this.context;
    return Promise.resolve({ outputFileUri });
  }
}
