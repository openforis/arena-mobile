import { File, FileHandle } from "expo-file-system";

import { PromiseUtils } from "utils/PromiseUtils";

// geotiff.js source reading byte ranges of a local file (the file is never read as a whole)

export type ByteRange = { offset: number; length: number };

type RangeReader = (range: ByteRange) => Promise<Uint8Array>;

// contiguous ranges (e.g. consecutive strips) are read with one call
export const mergeContiguousRanges = (
  ranges: ByteRange[],
): { merged: ByteRange; parts: ByteRange[] }[] => {
  const groups: { merged: ByteRange; parts: ByteRange[] }[] = [];
  for (const range of ranges) {
    const last = groups.at(-1);
    if (last && last.merged.offset + last.merged.length === range.offset) {
      last.merged.length += range.length;
      last.parts.push(range);
    } else {
      groups.push({ merged: { ...range }, parts: [range] });
    }
  }
  return groups;
};

export class GeoTiffFileSource {
  readsCount = 0;
  bytesRead = 0;
  // one read at a time: the file handle has a single offset
  private readonly enqueue = PromiseUtils.createSerialQueue();

  constructor(
    private readonly readRange: RangeReader,
    private readonly size: number,
    private readonly onClose: () => void = () => {},
  ) {}

  static open(fileUri: string): GeoTiffFileSource {
    const handle: FileHandle = new File(fileUri).open();
    const size = handle.size ?? 0;
    const readRange: RangeReader = ({ offset, length }) => {
      handle.offset = offset;
      return handle.readBytes(length);
    };
    return new GeoTiffFileSource(readRange, size, () => handle.close());
  }

  get fileSize(): number {
    return this.size;
  }

  private read(range: ByteRange): Promise<Uint8Array> {
    const length = Math.max(
      0,
      Math.min(range.length, this.size - range.offset),
    );
    return this.enqueue(() =>
      this.readRange({ offset: range.offset, length }),
    ).then((bytes) => {
      this.readsCount += 1;
      this.bytesRead += bytes.length;
      return bytes;
    });
  }

  async fetch(slices: ByteRange[]): Promise<ArrayBuffer[]> {
    const groups = await Promise.all(
      mergeContiguousRanges(slices).map(async ({ merged, parts }) => {
        const bytes = await this.read(merged);
        // copies: geotiff.js keeps the buffers it gets
        return parts.map((part) => {
          const start = part.offset - merged.offset;
          return bytes.slice(start, Math.min(start + part.length, bytes.length))
            .buffer;
        });
      }),
    );
    return groups.flat();
  }

  close(): Promise<void> {
    this.onClose();
    return Promise.resolve();
  }
}
