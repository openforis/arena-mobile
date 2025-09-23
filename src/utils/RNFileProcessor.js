import { FileProcessor } from "@openforis/arena-core";
import { Files } from "./Files";

export class RNFileProcessor extends FileProcessor {
  async calculateFileSize() {
    const { filePath: fileUri } = this;
    return Files.getSizeBase64(fileUri);
  }

  async extractCurrentFileChunk() {
    const { filePath: fileUri, currentChunkNumber, chunkSize } = this;
    return Files.readChunk(fileUri, currentChunkNumber, chunkSize);
  }
}
