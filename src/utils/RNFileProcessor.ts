import { File, FileHandle } from "expo-file-system/next";

import {
  FileProcessor,
  FileProcessorConstructorArgs,
} from "@openforis/arena-core";

import { Files } from "./Files";

export type RNFileProcessorArgs = FileProcessorConstructorArgs & {};

export class RNFileProcessor extends FileProcessor {
  eFile: File;
  fileHandle: FileHandle;

  constructor(args: RNFileProcessorArgs) {
    super(args);

    this.eFile = new File(args.filePath!);
    this.fileHandle = this.eFile.open();
  }

  override async calculateFileSize() {
    const { filePath: fileUri } = this as any;
    return Files.getSize(fileUri);
  }

  override async extractCurrentFileChunk() {
    const { currentChunkNumber, chunkSize } = this as any;
    this.fileHandle.offset = (currentChunkNumber - 1) * chunkSize;
    const bytes = this.fileHandle.readBytes(chunkSize);
    return bytes;
  }
}
