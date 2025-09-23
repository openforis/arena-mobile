import { FileProcessor } from "@openforis/arena-core";
import { Files } from "./Files";

export class RNFileProcessor extends FileProcessor {
  async calculateFileSize() {
    const { filePath: fileUri } = this;
    const size1 = await Files.getSize(fileUri);
    // const size2 = await Files.getSizeBase64(fileUri);
    // console.log("===size", size1, size2);
    return size1;
  }

  async extractCurrentFileChunk() {
    const { filePath: fileUri, currentChunkNumber, chunkSize } = this;
    return Files.readChunk(fileUri, currentChunkNumber, chunkSize);
  }
}
