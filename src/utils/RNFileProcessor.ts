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
  eFile: File;
  fileHandle: FileHandle;

  constructor(args: RNFileProcessorArgs) {
    super(args);

    this.fileId = args.fileId;
    this.eFile = new File(args.filePath!);
    this.fileHandle = this.eFile.open();
  }

  override async calculateFileSize() {
    const { filePath: fileUri } = this as any;
    return Files.getSize(fileUri);
  }

  override async extractCurrentFileChunk() {
    const { currentChunkNumber, chunkSize } = this as any;

    const fileName = `${this.fileId}_chunk_${currentChunkNumber}`;
    const start = (currentChunkNumber - 1) * chunkSize;
    const end = start + chunkSize;
    const chunkBlob = this.eFile.slice(start, end);
    return chunkBlob;
  }
}
