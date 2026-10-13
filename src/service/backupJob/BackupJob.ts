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
    const excludedDirs: { uri: string; tempUri: string }[] = [];
    for (const [index, uri] of [
      OfflineMapTilesStorage.getTilesRootDirUri(),
      PdfMapsStorage.getRootDirUri(),
    ].entries()) {
      if (await Files.exists(uri)) {
        const tempUri = Files.path(
          Files.cacheDirectory,
          `map_files_backup_${Date.now()}_${index}`,
        );
        await Files.moveFile({ from: uri, to: tempUri });
        excludedDirs.push({ uri, tempUri });
      }
    }
    try {
      await Files.zip(Files.documentDirectory, outputFileUri);
    } finally {
      for (const { uri, tempUri } of excludedDirs) {
        await Files.moveFile({ from: tempUri, to: uri });
      }
    }

    this.context.outputFileUri = outputFileUri;
  }

  override generateResult() {
    const { outputFileUri } = this.context;
    return Promise.resolve({ outputFileUri });
  }
}
