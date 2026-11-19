import type { ArenaSurvey } from "@openforis/arena-core";

import { RecordSyncStatus } from "../../model/RecordSyncStatus";

import {
  buildRecordsCountSummary,
  checkCanSendData,
  ExportRecord,
  filterRecordsByUuids,
  getLocalRecordUuids,
  groupRecordsForExport,
  hasMergeableConflicts,
  isNothingToExport,
  selectRecordsToExport,
} from "./recordsExportUtils";

// the real modules pull in the whole arena-core/model graph, which Jest can't load as-is
jest.mock("model", () => ({
  RecordOrigin: { local: "local", remote: "remote" },
  RecordSyncStatus: jest.requireActual("../../model/RecordSyncStatus")
    .RecordSyncStatus,
  RecordSummaries: {
    hasErrors: (record: any) => (record.validation?.counts?.errors ?? 0) > 0,
  },
  RecordUpdateConflictResolutionStrategy: {
    merge: "merge",
    overwriteIfUpdated: "overwriteIfUpdated",
  },
}));
jest.mock("@openforis/arena-core", () => ({
  Surveys: {
    isVisibleInMobile: (survey: any) =>
      survey.props.security.visibleInMobile ?? true,
    isRecordsUploadFromMobileAllowed: (survey: any) =>
      survey.props.security.allowRecordsUploadFromMobile ?? true,
    isRecordsWithErrorsUploadFromMobileAllowed: (survey: any) =>
      survey.props.security.allowRecordsWithErrorsUploadFromMobile ?? false,
  },
}));

const surveyWithSecurity = (security: Record<string, boolean> = {}) =>
  ({ props: { security } }) as unknown as ArenaSurvey;

const withErrors = {
  validation: { valid: false, counts: { errors: 1, warnings: 0 } },
};

const record = (
  uuid: string,
  syncStatus?: string,
  props: Partial<ExportRecord> = {},
): ExportRecord => ({ uuid, syncStatus, ...props });

const uuidsOf = (records: ExportRecord[]) => records.map((r) => r.uuid);

describe("filterRecordsByUuids", () => {
  const records = [record("a"), record("b"), record("c")];

  test("only the given records", () => {
    expect(uuidsOf(filterRecordsByUuids(records, ["a", "c"]))).toEqual([
      "a",
      "c",
    ]);
  });

  test("all records without a selection", () => {
    expect(filterRecordsByUuids(records, undefined)).toBe(records);
    expect(filterRecordsByUuids(records, [])).toBe(records);
  });
});

describe("getLocalRecordUuids", () => {
  test("only records in the device", () => {
    expect(
      getLocalRecordUuids([
        record("a", undefined, { origin: "local" }),
        record("b", undefined, { origin: "remote" }),
      ]),
    ).toEqual(["a"]);
  });
});

describe("checkCanSendData", () => {
  const records = [record("valid"), record("invalid", undefined, withErrors)];

  test("survey must be selected, visible in mobile and allow uploads", () => {
    expect(checkCanSendData({ survey: undefined, records })).toBe(
      "recordsList:sendData.error.surveyNotSelected",
    );
    expect(
      checkCanSendData({
        survey: surveyWithSecurity({ visibleInMobile: false }),
        records,
      }),
    ).toBe("recordsList:sendData.error.surveyNotVisibleInMobile");
    expect(
      checkCanSendData({
        survey: surveyWithSecurity({ allowRecordsUploadFromMobile: false }),
        records,
      }),
    ).toBe("recordsList:sendData.error.recordsUploadNotAllowed");
  });

  test("records with errors only when the survey allows them", () => {
    expect(checkCanSendData({ survey: surveyWithSecurity(), records })).toBe(
      "recordsList:sendData.error.recordsWithErrorsUploadNotAllowed",
    );
    expect(
      checkCanSendData({
        survey: surveyWithSecurity({
          allowRecordsWithErrorsUploadFromMobile: true,
        }),
        records,
      }),
    ).toBeUndefined();
  });

  test("only the selected records are checked for errors", () => {
    expect(
      checkCanSendData({
        survey: surveyWithSecurity(),
        records,
        selectedRecordUuids: ["valid"],
      }),
    ).toBeUndefined();
  });
});

describe("groupRecordsForExport", () => {
  const records = [
    record("new", RecordSyncStatus.new),
    record("updated", RecordSyncStatus.modifiedLocally),
    record("conflicting", RecordSyncStatus.conflictingKeys),
    record("remote", RecordSyncStatus.modifiedRemotely),
    record("both", RecordSyncStatus.modifiedLocallyAndRemotely),
    record("notModified", RecordSyncStatus.notModified),
    record("readOnly", RecordSyncStatus.new, { readOnly: true }),
  ];

  test("groups the uploadable records by sync status", () => {
    const groups = groupRecordsForExport(records);
    expect(uuidsOf(groups.newRecords)).toEqual(["new"]);
    expect(uuidsOf(groups.updatedRecords)).toEqual(["updated"]);
    expect(uuidsOf(groups.conflictingRecords)).toEqual(["conflicting"]);
    expect(uuidsOf(groups.sameRecordConflicts)).toEqual(["remote", "both"]);
  });

  test("nothing to export without records to send", () => {
    expect(isNothingToExport(groupRecordsForExport(records))).toBe(false);
    expect(
      isNothingToExport(
        groupRecordsForExport([record("x", RecordSyncStatus.notModified)]),
      ),
    ).toBe(true);
  });
});

describe("hasMergeableConflicts", () => {
  const conflictingOnly = groupRecordsForExport([
    record("conflicting", RecordSyncStatus.conflictingKeys),
  ]);

  test("records with the same keys count only if the survey allows merging them", () => {
    expect(
      hasMergeableConflicts({
        groups: conflictingOnly,
        mergeWithSameKeysAllowed: true,
      }),
    ).toBe(true);
    expect(
      hasMergeableConflicts({
        groups: conflictingOnly,
        mergeWithSameKeysAllowed: false,
      }),
    ).toBe(false);
  });

  test("records modified on the server too always count", () => {
    expect(
      hasMergeableConflicts({
        groups: groupRecordsForExport([
          record("remote", RecordSyncStatus.modifiedRemotely),
        ]),
        mergeWithSameKeysAllowed: false,
      }),
    ).toBe(true);
  });
});

describe("buildRecordsCountSummary", () => {
  test("counts by status, plus the records with errors", () => {
    const records = [
      record("new", RecordSyncStatus.new, withErrors),
      record("updated", RecordSyncStatus.modifiedLocally),
      record("both", RecordSyncStatus.modifiedLocallyAndRemotely),
    ];
    expect(
      buildRecordsCountSummary({
        groups: groupRecordsForExport(records),
        records,
      }),
    ).toEqual({
      new: 1,
      updated: 1,
      conflicting: 0,
      conflictingModifiedRemotely: 1,
      withValidationErrors: 1,
    });
  });
});

describe("selectRecordsToExport", () => {
  const groups = groupRecordsForExport([
    record("new", RecordSyncStatus.new),
    record("updated", RecordSyncStatus.modifiedLocally),
    record("conflicting", RecordSyncStatus.conflictingKeys),
    record("remote", RecordSyncStatus.modifiedRemotely),
  ]);

  test("only new and updated records without merge", () => {
    expect(
      selectRecordsToExport({
        groups,
        mergeSelected: false,
        mergeWithSameKeysAllowed: true,
      }),
    ).toEqual({
      recordUuids: ["new", "updated"],
      conflictResolutionStrategy: "overwriteIfUpdated",
    });
  });

  test("conflicting records too with merge", () => {
    expect(
      selectRecordsToExport({
        groups,
        mergeSelected: true,
        mergeWithSameKeysAllowed: true,
      }),
    ).toEqual({
      recordUuids: ["new", "updated", "conflicting", "remote"],
      conflictResolutionStrategy: "merge",
    });
  });

  test("records with the same keys left out when the survey doesn't allow merging them", () => {
    expect(
      selectRecordsToExport({
        groups,
        mergeSelected: true,
        mergeWithSameKeysAllowed: false,
      }).recordUuids,
    ).toEqual(["new", "updated", "remote"]);
  });
});
