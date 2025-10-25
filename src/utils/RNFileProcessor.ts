import { FileProcessor } from "@openforis/arena-core";
import { Files } from "./Files";

export class RNFileProcessor extends FileProcessor {
  override async calculateFileSize() {
    const { filePath: fileUri } = this as any;
    return Files.getSize(fileUri);
  }

  override async extractCurrentFileChunk() {
    const { filePath: fileUri, currentChunkNumber, chunkSize } = this as any;
    return Files.readChunk(fileUri, currentChunkNumber, chunkSize);
  }
}
