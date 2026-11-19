import type { ArenaSurvey } from "@openforis/arena-core";

import { RecordSyncStatus } from "../../model/RecordSyncStatus";
import { AutoSyncStatus } from "../autoSync/types";

import {
  AutoSyncRecord,
  getAutoSyncIntervalsMs,
  isAlreadyUpToDate,
  isRecordIdle,
  OPEN_RECORD_MERGE_MIN_IDLE_MS,
  selectAutoFetchCandidates,
  selectAutoMergeCandidates,
  selectAutoSyncCandidates,
} from "./autoSyncCandidates";

// the real modules pull in the whole arena-core/model graph, which Jest can't load as-is
jest.mock("model", () => ({
  RecordSyncStatus: jest.requireActual("../../model/RecordSyncStatus")
    .RecordSyncStatus,
  RecordSummaries: {
    hasErrors: (record: any) => (record.validation?.counts?.errors ?? 0) > 0,
  },
}));
jest.mock("@openforis/arena-core", () => ({
  Surveys: {
    isRecordsWithErrorsUploadFromMobileAllowed: (survey: any) =>
      survey?.props?.security?.allowRecordsWithErrorsUpload ?? false,
    isVisibleInMobile: () => true,
    isRecordsDownloadInMobileAllowed: (survey: any) =>
      survey?.props?.security?.allowRecordsDownloadInMobile ?? true,
  },
}));

const surveyWithSecurity = (security: Record<string, boolean> = {}) =>
  ({ props: { security } }) as unknown as ArenaSurvey;

const survey = surveyWithSecurity();
const surveyErrorsAllowed = surveyWithSecurity({
  allowRecordsWithErrorsUpload: true,
});

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();

const record = (
  uuid: string,
  syncStatus: string,
  props: Partial<AutoSyncRecord> = {},
): AutoSyncRecord => ({ uuid, syncStatus, ...props });

const withErrors = {
  validation: { valid: false, counts: { errors: 1, warnings: 0 } },
};

const uuidsOf = (records: AutoSyncRecord[]) => records.map((r) => r.uuid);

describe("getAutoSyncIntervalsMs", () => {
  test("defaults when the settings are missing", () => {
    expect(getAutoSyncIntervalsMs()).toEqual({
      openRecordIdleThresholdMs: 5 * 60_000,
      slowCheckIntervalMs: 30 * 60_000,
    });
  });

  test("minutes from the settings", () => {
    expect(
      getAutoSyncIntervalsMs({
        autoSyncOpenRecordIntervalMinutes: 2,
        autoSyncSlowCheckIntervalMinutes: 10,
      }),
    ).toEqual({
      openRecordIdleThresholdMs: 2 * 60_000,
      slowCheckIntervalMs: 10 * 60_000,
    });
  });
});

describe("isAlreadyUpToDate", () => {
  const slowCheckIntervalMs = 10 * 60_000;

  test("true when synced and checked recently", () => {
    expect(
      isAlreadyUpToDate({
        autoSyncState: {
          status: AutoSyncStatus.synced,
          lastCheckedAt: minutesAgo(1),
        },
        slowCheckIntervalMs,
      }),
    ).toBe(true);
  });

  test("false when the last check is too old or missing", () => {
    expect(
      isAlreadyUpToDate({
        autoSyncState: {
          status: AutoSyncStatus.needsManualFix,
          lastCheckedAt: minutesAgo(11),
        },
        slowCheckIntervalMs,
      }),
    ).toBe(false);
    expect(
      isAlreadyUpToDate({
        autoSyncState: { status: AutoSyncStatus.synced, lastCheckedAt: null },
        slowCheckIntervalMs,
      }),
    ).toBe(false);
  });

  test("false when something is pending", () => {
    expect(
      isAlreadyUpToDate({
        autoSyncState: {
          status: AutoSyncStatus.pending,
          lastCheckedAt: minutesAgo(1),
        },
        slowCheckIntervalMs,
      }),
    ).toBe(false);
  });
});

describe("isRecordIdle", () => {
  const now = Date.now();

  test("compares the time since the last modification with the threshold", () => {
    const r = record("a", RecordSyncStatus.new, {
      dateModified: minutesAgo(3),
    });
    expect(isRecordIdle({ record: r, now, idleThresholdMs: 2 * 60_000 })).toBe(
      true,
    );
    expect(isRecordIdle({ record: r, now, idleThresholdMs: 5 * 60_000 })).toBe(
      false,
    );
  });

  test("without modification date, idle only when the threshold is bypassed", () => {
    const r = record("a", RecordSyncStatus.new);
    expect(isRecordIdle({ record: r, now, idleThresholdMs: -1 })).toBe(true);
    expect(isRecordIdle({ record: r, now, idleThresholdMs: 0 })).toBe(false);
  });
});

describe("selectAutoSyncCandidates", () => {
  const openRecordIdleThresholdMs = 5 * 60_000;

  test("only new or locally modified records, not read-only", () => {
    const records = [
      record("new", RecordSyncStatus.new),
      record("modified", RecordSyncStatus.modifiedLocally),
      record("remote", RecordSyncStatus.modifiedRemotely),
      record("conflict", RecordSyncStatus.conflictingKeys),
      record("readOnly", RecordSyncStatus.new, { readOnly: true }),
      record("noStatus", ""),
    ];
    expect(
      uuidsOf(
        selectAutoSyncCandidates({
          records,
          survey,
          openRecordIdleThresholdMs,
        }),
      ),
    ).toEqual(["new", "modified"]);
  });

  test("records with errors only when the survey allows them", () => {
    const records = [
      record("valid", RecordSyncStatus.new),
      record("invalid", RecordSyncStatus.new, withErrors),
    ];
    expect(
      uuidsOf(
        selectAutoSyncCandidates({
          records,
          survey,
          openRecordIdleThresholdMs,
        }),
      ),
    ).toEqual(["valid"]);
    expect(
      uuidsOf(
        selectAutoSyncCandidates({
          records,
          survey: surveyErrorsAllowed,
          openRecordIdleThresholdMs,
        }),
      ),
    ).toEqual(["valid", "invalid"]);
  });

  test("the record open in the editor only once idle", () => {
    const records = [
      record("open", RecordSyncStatus.modifiedLocally, {
        dateModified: minutesAgo(1),
      }),
      record("other", RecordSyncStatus.modifiedLocally, {
        dateModified: minutesAgo(1),
      }),
    ];
    const params = { records, survey, currentlyEditedRecordUuid: "open" };
    expect(
      uuidsOf(
        selectAutoSyncCandidates({ ...params, openRecordIdleThresholdMs }),
      ),
    ).toEqual(["other"]);
    expect(
      uuidsOf(
        selectAutoSyncCandidates({ ...params, openRecordIdleThresholdMs: -1 }),
      ),
    ).toEqual(["open", "other"]);
  });
});

describe("selectAutoMergeCandidates", () => {
  const records = [
    record("both", RecordSyncStatus.modifiedLocallyAndRemotely),
    record("remoteNeverSynced", RecordSyncStatus.modifiedRemotely),
    record("remoteOnly", RecordSyncStatus.modifiedRemotely, {
      dateModifiedSynced: minutesAgo(60),
    }),
    record("local", RecordSyncStatus.modifiedLocally),
    record("invalid", RecordSyncStatus.modifiedLocallyAndRemotely, withErrors),
  ];

  test("records modified on the server too, except the ones with only remote changes", () => {
    expect(
      uuidsOf(
        selectAutoMergeCandidates({
          records,
          survey,
          autoSyncEnabled: true,
          openRecordIdleThresholdMs: 0,
        }),
      ),
    ).toEqual(["both", "remoteNeverSynced"]);
  });

  test("none when auto-merge isn't allowed", () => {
    expect(
      selectAutoMergeCandidates({
        records,
        survey,
        autoSyncEnabled: false,
        openRecordIdleThresholdMs: 0,
      }),
    ).toEqual([]);
    expect(
      selectAutoMergeCandidates({
        records,
        survey: surveyWithSecurity({ allowRecordsDownloadInMobile: false }),
        autoSyncEnabled: true,
        openRecordIdleThresholdMs: 0,
      }),
    ).toEqual([]);
  });

  test("the open record waits a minimum idle time even when the threshold is bypassed", () => {
    const justModified = new Date(
      Date.now() - OPEN_RECORD_MERGE_MIN_IDLE_MS / 2,
    ).toISOString();
    const openRecords = [
      record("open", RecordSyncStatus.modifiedLocallyAndRemotely, {
        dateModified: justModified,
      }),
    ];
    expect(
      selectAutoMergeCandidates({
        records: openRecords,
        survey,
        autoSyncEnabled: true,
        currentlyEditedRecordUuid: "open",
        openRecordIdleThresholdMs: -1,
      }),
    ).toEqual([]);
  });
});

describe("selectAutoFetchCandidates", () => {
  const records = [
    record("remoteOnly", RecordSyncStatus.modifiedRemotely, {
      dateModifiedSynced: minutesAgo(60),
    }),
    record("open", RecordSyncStatus.modifiedRemotely, {
      dateModifiedSynced: minutesAgo(60),
    }),
    record("both", RecordSyncStatus.modifiedLocallyAndRemotely),
  ];

  test("records with only remote changes, except the open one", () => {
    expect(
      uuidsOf(
        selectAutoFetchCandidates({
          records,
          survey,
          autoSyncEnabled: true,
          currentlyEditedRecordUuid: "open",
        }),
      ),
    ).toEqual(["remoteOnly"]);
  });

  test("none when auto-sync is disabled", () => {
    expect(
      selectAutoFetchCandidates({ records, survey, autoSyncEnabled: false }),
    ).toEqual([]);
  });
});
