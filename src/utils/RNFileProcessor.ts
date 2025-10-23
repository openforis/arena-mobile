import { FileProcessor } from "@openforis/arena-core";
import { Files } from "./Files";

export class RNFileProcessor extends FileProcessor {
  // @ts-expect-error TS(4114): This member must have an 'override' modifier becau... Remove this comment to see the full error message
  async calculateFileSize() {
    // @ts-expect-error TS(2341): Property 'filePath' is private and only accessible... Remove this comment to see the full error message
    const { filePath: fileUri } = this;
    return Files.getSize(fileUri);
  }

  // @ts-expect-error TS(4114): This member must have an 'override' modifier becau... Remove this comment to see the full error message
  async extractCurrentFileChunk() {
    // @ts-expect-error TS(2341): Property 'filePath' is private and only accessible... Remove this comment to see the full error message
    const { filePath: fileUri, currentChunkNumber, chunkSize } = this;
    return Files.readChunk(fileUri, currentChunkNumber, chunkSize);
  }
}
