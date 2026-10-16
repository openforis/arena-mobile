import { JobMobile, JobMobileContext } from "model/JobMobile";
import { PdfMap } from "model/PdfMap";
import { Files } from "utils/Files";
import { PdfMapGeoreference } from "utils/GeoPdfTilePlanner";

import { PdfMapRenderer } from "./PdfMapRenderer";
import { PdfMapsStorage } from "./pdfMapsStorage";
import { PdfMapRepository } from "./pdfMapRepository";
import { PdfMapTilesRenderer } from "./pdfMapTilesRenderer";

export type PdfMapImportJobContext = JobMobileContext & {
  // file selected by the user (it will be copied into the app storage)
  sourceFileUri: string;
  pdfMap: PdfMap;
  georeference: PdfMapGeoreference;
};

export type PdfMapImportJobResult = {
  pdfMap: PdfMap;
};

export class PdfMapImportJob extends JobMobile<PdfMapImportJobContext> {
  private tilesCount = 0;
  private sizeBytes = 0;

  override async execute() {
    const { pdfMap, sourceFileUri, georeference } = this.context;
    const mapDirUri = PdfMapsStorage.getMapDirUri(pdfMap.id);
    try {
      await Files.mkDir(mapDirUri);
      const sourceCopyUri = PdfMapsStorage.getSourceFileUri(pdfMap.id);
      await Files.copyFile({ from: sourceFileUri, to: sourceCopyUri });
      const pdfPath = PdfMapsStorage.toFileSystemPath(sourceCopyUri);
      // fails if the PDF cannot be opened by the native renderer (e.g. password protected)
      await PdfMapRenderer.getPageCount(pdfPath);

      const { tilesCount, sizeBytes } = await PdfMapTilesRenderer.renderTiles({
        pdfPath,
        georeference,
        minZoom: pdfMap.minZoom,
        maxZoom: pdfMap.maxZoom,
        tilesPath: PdfMapsStorage.getTilesCachePath(pdfMap.id),
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
    const pdfMap: PdfMap = {
      ...this.context.pdfMap,
      tilesCount: this.tilesCount,
      sizeBytes: this.sizeBytes,
      sourceSizeBytes: await Files.getSize(sourceCopyUri),
      dateCreated: now,
      dateModified: now,
    };
    await PdfMapRepository.saveMap(pdfMap);
    this.context.pdfMap = pdfMap;
  }

  override generateResult(): Promise<PdfMapImportJobResult> {
    return Promise.resolve({ pdfMap: this.context.pdfMap });
  }
}
