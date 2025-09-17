import { FileProcessor } from "@openforis/arena-core";
import { Files } from "./Files";

export class RNFileProcessor extends FileProcessor {
  extractCurrentFileChunk() {
    const { filePath: fileUri, currentChunkNumber, chunkSize } = this;
    return Files.readChunk(fileUri, currentChunkNumber, chunkSize);
  }
}
