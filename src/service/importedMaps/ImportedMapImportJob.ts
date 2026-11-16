import { JobMobile, JobMobileContext } from "model/JobMobile";
import { ImportedMap } from "model/ImportedMap";
import { Files } from "utils/Files";
import { ImportedMapGeoreference } from "utils/GeoPdfTilePlanner";

import { ImportedMapRenderer } from "./ImportedMapRenderer";
import { ImportedMapsStorage } from "./importedMapsStorage";
import { ImportedMapRepository } from "./importedMapRepository";
import { ImportedMapTilesRenderer } from "./importedMapTilesRenderer";

export type ImportedMapImportJobContext = JobMobileContext & {
  // file selected by the user (it will be copied into the app storage)
  sourceFileUri: string;
  importedMap: ImportedMap;
  georeference: ImportedMapGeoreference;
};

export type ImportedMapImportJobResult = {
  importedMap: ImportedMap;
};

export class ImportedMapImportJob extends JobMobile<ImportedMapImportJobContext> {
  private tilesCount = 0;
  private sizeBytes = 0;

  override async execute() {
    const { importedMap, sourceFileUri, georeference } = this.context;
    const mapDirUri = ImportedMapsStorage.getMapDirUri(importedMap.id);
    try {
      await Files.mkDir(mapDirUri);
      const sourceCopyUri = ImportedMapsStorage.getSourceFileUri(
        importedMap.id,
      );
      await Files.copyFile({ from: sourceFileUri, to: sourceCopyUri });
      const pdfPath = ImportedMapsStorage.toFileSystemPath(sourceCopyUri);
      // fails if the PDF cannot be opened by the native renderer (e.g. password protected)
      await ImportedMapRenderer.getPageCount(pdfPath);

      const { tilesCount, sizeBytes } =
        await ImportedMapTilesRenderer.renderTiles({
          pdfPath,
          georeference,
          minZoom: importedMap.minZoom,
          maxZoom: importedMap.maxZoom,
          tilesPath: ImportedMapsStorage.getTilesCachePath(importedMap.id),
          shouldStop: () => this.isCanceled(),
          onTotal: (total) => {
            this.total = total;
          },
          onStepComplete: () => this.incrementProcessedItems(),
        });
      this.tilesCount = tilesCount;
      this.sizeBytes = sizeBytes;

      if (this.isCanceled()) {
        await Files.del(mapDirUri, true);
        return;
      }
      await this.saveMap(sourceCopyUri);
    } catch (error) {
      await Files.del(mapDirUri, true);
      throw error;
    }
  }

  private async saveMap(sourceCopyUri: string): Promise<void> {
    const now = new Date().toISOString();
    const importedMap: ImportedMap = {
      ...this.context.importedMap,
      tilesCount: this.tilesCount,
      sizeBytes: this.sizeBytes,
      sourceSizeBytes: await Files.getSize(sourceCopyUri),
      dateCreated: now,
      dateModified: now,
    };
    await ImportedMapRepository.saveMap(importedMap);
    this.context.importedMap = importedMap;
  }

  override generateResult(): Promise<ImportedMapImportJobResult> {
    return Promise.resolve({ importedMap: this.context.importedMap });
  }
}
