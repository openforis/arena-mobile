import { RecordOrigin, RecordSyncStatus } from "model";

import { RecordService } from "./recordService";

jest.mock("./repository/recordRepository", () => ({ RecordRepository: {} }));
jest.mock("./recordRemoteService", () => ({ RecordRemoteService: {} }));
jest.mock("./recordFileService", () => ({ RecordFileService: {} }));
jest.mock("./areaOfInterestProvider", () => ({}));
jest.mock("utils", () => ({ ArrayUtils: {}, log: {}, PromiseUtils: {} }));
jest.mock("model", () => ({
  RecordLoadStatus: { summary: "S", complete: "C" },
  RecordOrigin: { local: "L", remote: "R" },
  RecordSummaries: {
    getKeyValues: ({ recordSummary }: any) =>
      Object.values(recordSummary.keysObj),
  },
  RecordSyncStatus: jest.requireActual("model/RecordSyncStatus")
    .RecordSyncStatus,
  RecordUtils: {},
  UserGroupQualifiers: {},
}));

const uuid = "record-uuid";
const t0 = "2026-01-01T10:00:00.000Z";
const t1 = "2026-01-01T11:00:00.000Z";
const t2 = "2026-01-01T12:00:00.000Z";

const local = (props: any = {}) => ({
  uuid,
  origin: RecordOrigin.local,
  keysObj: { plot: 1 },
  ...props,
});
const remote = (props: any = {}) => ({ uuid, step: 1, ...props });

const determine = (recordSummaryLocal: any, recordSummaryRemote?: any) =>
  RecordService.determineRecordSyncStatus({
    survey: {},
    recordSummaryLocal,
    recordSummaryRemote,
  });

describe("RecordService.determineRecordSyncStatus", () => {
  it("accepts 0 as a key value", () => {
    expect(determine(local({ keysObj: { plot: 0 } }))).toBe(
      RecordSyncStatus.new,
    );
  });

  it.each([[null], [undefined], [""]])("rejects %p as a key value", (plot) => {
    expect(determine(local({ keysObj: { plot } }))).toBe(
      RecordSyncStatus.keysNotSpecified,
    );
  });

  it("detects records no more in the entry step", () => {
    expect(determine(local(), remote({ step: 2 }))).toBe(
      RecordSyncStatus.notInEntryStepAnymore,
    );
  });

  it("detects other records with the same keys", () => {
    expect(determine(local(), remote({ uuid: "other" }))).toBe(
      RecordSyncStatus.conflictingKeys,
    );
  });

  describe("without a baseline", () => {
    it.each([
      [t1, t0, RecordSyncStatus.modifiedLocally],
      [t0, t1, RecordSyncStatus.modifiedRemotely],
      [t0, t0, RecordSyncStatus.notModified],
    ])("local %s, remote %s: %s", (dateLocal, dateRemote, expected) => {
      expect(
        determine(
          local({ dateModified: dateLocal }),
          remote({ dateModified: dateRemote }),
        ),
      ).toBe(expected);
    });
  });

  describe("with a baseline", () => {
    it.each([
      [t0, t0, RecordSyncStatus.notModified],
      [t1, t0, RecordSyncStatus.modifiedLocally],
      [t0, t1, RecordSyncStatus.modifiedRemotely],
      [t1, t2, RecordSyncStatus.modifiedLocallyAndRemotely],
    ])("local %s, remote %s: %s", (dateLocal, dateRemote, expected) => {
      expect(
        determine(
          local({ dateModified: dateLocal, dateModifiedRemote: t0 }),
          remote({ dateModified: dateRemote }),
        ),
      ).toBe(expected);
    });
  });

  describe("with the local date of the last sync", () => {
    const synced = { dateModifiedRemote: t2, dateModifiedSynced: t0 };

    it("detects an edit made with the device clock behind the server", () => {
      expect(
        determine(
          local({ ...synced, dateModified: t1 }),
          remote({ dateModified: t2 }),
        ),
      ).toBe(RecordSyncStatus.modifiedLocally);
    });

    it("does not see a change when the server date differs from the local one", () => {
      expect(
        determine(
          local({ ...synced, dateModified: t0 }),
          remote({ dateModified: t2 }),
        ),
      ).toBe(RecordSyncStatus.notModified);
    });
  });

  it("flags downloaded records changed on the server", () => {
    expect(
      determine(
        local({ origin: RecordOrigin.remote, loadStatus: "C", dateSynced: t0 }),
        remote({ dateModified: t1 }),
      ),
    ).toBe(RecordSyncStatus.notUpToDate);
  });
});
