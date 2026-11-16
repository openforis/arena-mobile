import { File, FileHandle } from "expo-file-system";

// geotiff.js source reading byte ranges of a local file (the file is never read as a whole)

export type ByteRange = { offset: number; length: number };

type RangeReader = (range: ByteRange) => Promise<Uint8Array>;

// contiguous ranges (e.g. consecutive strips) are read with one call
export const mergeContiguousRanges = (
  ranges: ByteRange[],
): { merged: ByteRange; parts: ByteRange[] }[] => {
  const groups: { merged: ByteRange; parts: ByteRange[] }[] = [];
  for (const range of ranges) {
    const last = groups[groups.length - 1];
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
  private queue: Promise<unknown> = Promise.resolve();

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

  // reads one group at a time: the file handle has a single offset
  fetch(slices: ByteRange[]): Promise<ArrayBuffer[]> {
    const run = async (): Promise<ArrayBuffer[]> => {
      const result: ArrayBuffer[] = [];
      for (const { merged, parts } of mergeContiguousRanges(slices)) {
        const length = Math.max(
          0,
          Math.min(merged.length, this.size - merged.offset),
        );
        const bytes = await this.readRange({ offset: merged.offset, length });
        this.readsCount += 1;
        this.bytesRead += bytes.length;
        for (const part of parts) {
          const start = part.offset - merged.offset;
          // a copy: geotiff.js keeps the buffers it gets
          result.push(
            bytes.slice(start, Math.min(start + part.length, bytes.length))
              .buffer,
          );
        }
      }
      return result;
    };
    const next = this.queue.then(run);
    this.queue = next.catch(() => undefined);
    return next;
  }

  close(): Promise<void> {
    this.onClose();
    return Promise.resolve();
  }
}
