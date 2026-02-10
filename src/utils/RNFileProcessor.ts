import { File, FileHandle } from "expo-file-system/next";

import {
  FileProcessor,
  FileProcessorConstructorArgs,
} from "@openforis/arena-core";

import { Files } from "./Files";

export type RNFileProcessorArgs = FileProcessorConstructorArgs & {
  fileId: string;
};

export class RNFileProcessor extends FileProcessor {
  fileId: string;
  fileHandle: FileHandle;

  constructor(args: RNFileProcessorArgs) {
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
    const { filePath: fileUri } = this as any;
    return Files.getSize(fileUri);
  }

  override async extractCurrentFileChunk() {
    const { currentChunkNumber, chunkSize } = this as any;

    if (!this.fileHandle?.size) {
      throw new Error(
        "File handle is not initialized or file size is unavailable.",
      );
    }
    let tempFileUri;
    try {
      const tempFileName = `${this.fileId}_chunk_${currentChunkNumber}.tmp`;
      const start = (currentChunkNumber - 1) * chunkSize;

      const remainingSize = this.fileHandle.size - start;
      const length = Math.min(chunkSize, remainingSize);

      // Set the offset and read the chunk
      this.fileHandle.offset = start;
      const chunkBytes = this.fileHandle.readBytes(length);

      // Write bytes to temp file
      tempFileUri = Files.path(Files.cacheDirectory, tempFileName);
      await Files.del(tempFileUri);

      await Files.writeBytesToFile({ fileUri: tempFileUri, bytes: chunkBytes });

      // Return React Native FormData compatible object
      return {
        uri: tempFileUri,
        type: "application/octet-stream",
        name: tempFileName,
      } as any;
    } catch (error) {
      // Clean up temp file in case of error
      await Files.del(tempFileUri);
      throw error;
    }
  }

  async close() {
    this.fileHandle?.close();
  }
}
