import { File, FileHandle } from "expo-file-system";

import {
  FileProcessor,
  ArenaFileProcessorConstructorArgs,
  ArenaFileProcessorUriChunk,
} from "@openforis/arena-core";

import { Files } from "./Files";

// R: result of the chunk processor
export type RNFileProcessorArgs<R> = ArenaFileProcessorConstructorArgs<
  ArenaFileProcessorUriChunk,
  R
> & {
  fileId: string;
};

export class RNFileProcessor<R = unknown> extends FileProcessor<
  ArenaFileProcessorUriChunk,
  R
> {
  fileId: string;
  fileHandle: FileHandle;

  constructor(args: RNFileProcessorArgs<R>) {
    super(args);
    const { fileId, filePath } = args;
    if (!filePath) {
      throw new Error("filePath is required to initialize RNFileProcessor");
    }
    this.fileId = fileId;
    const eFile = new File(filePath);
    this.fileHandle = eFile.open();
  }

  override async calculateFileSize() {
    // checked in the constructor
    return Files.getSize(this.filePath!);
  }

  override async extractCurrentFileChunk(): Promise<ArenaFileProcessorUriChunk> {
    const { currentChunkNumber, chunkSize } = this;

    if (!this.fileHandle?.size) {
      throw new Error(
        "File handle is not initialized or file size is unavailable.",
      );
    }
    let tempFileUri: string | undefined;
    try {
      const tempFileName = `${this.fileId}_chunk_${currentChunkNumber}.tmp`;
      const start = (currentChunkNumber - 1) * chunkSize;

      const remainingSize = this.fileHandle.size - start;
      const length = Math.min(chunkSize, remainingSize);

      // Set the offset and read the chunk
      this.fileHandle.offset = start;
      const chunkBytes = await this.fileHandle.readBytes(length);

      // Write bytes to temp file
      tempFileUri = Files.path(Files.cacheDirectory, tempFileName);
      if (await Files.exists(tempFileUri)) {
        await Files.del(tempFileUri);
      }
      await Files.writeBytesToFile({ fileUri: tempFileUri, bytes: chunkBytes });

      // Return React Native FormData compatible object
      return {
        uri: tempFileUri,
        type: "application/octet-stream",
        name: tempFileName,
      };
    } catch (error) {
      // Clean up temp file in case of error
      if (tempFileUri && (await Files.exists(tempFileUri))) {
        await Files.del(tempFileUri, true);
      }
      throw error;
    }
  }

  close() {
    this.fileHandle?.close();
  }
}
