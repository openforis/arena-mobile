jest.mock("expo-file-system", () => ({}));

import { GeoTiffFileSource, mergeContiguousRanges } from "./GeoTiffFileSource";

describe("mergeContiguousRanges", () => {
  it("merges consecutive ranges, keeping the order", () => {
    expect(
      mergeContiguousRanges([
        { offset: 10, length: 5 },
        { offset: 15, length: 5 },
        { offset: 30, length: 2 },
        { offset: 32, length: 3 },
        { offset: 0, length: 4 },
      ]).map(({ merged }) => merged),
    ).toEqual([
      { offset: 10, length: 10 },
      { offset: 30, length: 5 },
      { offset: 0, length: 4 },
    ]);
  });
});

describe("GeoTiffFileSource", () => {
  const fileBytes = Uint8Array.from({ length: 100 }, (_, i) => i);

  const createSource = () => {
    const reads: string[] = [];
    const source = new GeoTiffFileSource(async ({ offset, length }) => {
      reads.push(`${offset}+${length}`);
      return fileBytes.slice(offset, offset + length);
    }, fileBytes.length);
    return { source, reads };
  };

  it("returns the slices in the requested order, with one read per contiguous group", async () => {
    const { source, reads } = createSource();
    const result = await source.fetch([
      { offset: 20, length: 3 },
      { offset: 23, length: 2 },
      { offset: 5, length: 2 },
    ]);
    expect(result.map((buffer) => Array.from(new Uint8Array(buffer)))).toEqual([
      [20, 21, 22],
      [23, 24],
      [5, 6],
    ]);
    expect(reads).toEqual(["20+5", "5+2"]);
    expect(source.readsCount).toBe(2);
    expect(source.bytesRead).toBe(7);
  });

  it("truncates the slices at the end of the file", async () => {
    const { source } = createSource();
    const [buffer] = await source.fetch([{ offset: 95, length: 1024 }]);
    expect(new Uint8Array(buffer!)).toEqual(
      Uint8Array.from([95, 96, 97, 98, 99]),
    );
  });

  it("runs concurrent fetches one after the other", async () => {
    const order: string[] = [];
    const source = new GeoTiffFileSource(async ({ offset, length }) => {
      order.push(`start ${offset}`);
      await new Promise((resolve) =>
        setTimeout(resolve, offset === 0 ? 10 : 0),
      );
      order.push(`end ${offset}`);
      return fileBytes.slice(offset, offset + length);
    }, fileBytes.length);
    await Promise.all([
      source.fetch([{ offset: 0, length: 1 }]),
      source.fetch([{ offset: 50, length: 1 }]),
    ]);
    expect(order).toEqual(["start 0", "end 0", "start 50", "end 50"]);
  });
});
