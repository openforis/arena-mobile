import { splitRecordUuidsInBatches } from "./recordsUploadBatches";

describe("splitRecordUuidsInBatches", () => {
  it("keeps all the records in one batch when their files fit", () => {
    expect(
      splitRecordUuidsInBatches({
        recordUuids: ["a", "b", "c"],
        filesSizeByRecordUuid: { a: 30, b: 30 },
        maxBatchFilesSize: 100,
      }),
    ).toEqual([["a", "b", "c"]]);
  });

  it("splits the records keeping their order", () => {
    expect(
      splitRecordUuidsInBatches({
        recordUuids: ["a", "b", "c", "d"],
        filesSizeByRecordUuid: { a: 60, b: 40, c: 10, d: 95 },
        maxBatchFilesSize: 100,
      }),
    ).toEqual([["a", "b"], ["c"], ["d"]]);
  });

  it("puts a record with files bigger than the limit in its own batch", () => {
    expect(
      splitRecordUuidsInBatches({
        recordUuids: ["a", "b", "c"],
        filesSizeByRecordUuid: { a: 10, b: 500, c: 10 },
        maxBatchFilesSize: 100,
      }),
    ).toEqual([["a"], ["b"], ["c"]]);
  });

  it("returns no batches when there are no records", () => {
    expect(
      splitRecordUuidsInBatches({ recordUuids: [], filesSizeByRecordUuid: {} }),
    ).toEqual([]);
  });
});
