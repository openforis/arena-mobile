import { RecordSyncStatus } from "../../model/RecordSyncStatus";

import {
  computeAutoSyncStatus,
  hasConflictingKeysWithMergeNotAllowed,
} from "./autoSyncStatusUtils";
import { AutoSyncStatus } from "./types";

// the real modules pull in the whole arena-core/model graph, which Jest can't load as-is
jest.mock("model", () => ({
  RecordSyncStatus: jest.requireActual("../../model/RecordSyncStatus").RecordSyncStatus,
}));
jest.mock("@openforis/arena-core", () => ({
  Surveys: {
    isRecordsMergeWithSameKeysAllowed: (survey: any) =>
      survey?.props?.security?.allowRecordsMergeWithSameKeys ?? true,
  },
}));

const surveyMergeAllowed = { props: {} };
const surveyMergeNotAllowed = {
  props: { security: { allowRecordsMergeWithSameKeys: false } },
};

const recordsWithStatuses = (...statuses: string[]) =>
  statuses.map((syncStatus) => ({ syncStatus })) as any[];

describe("computeAutoSyncStatus", () => {
  test("synced when nothing to do", () => {
    expect(
      computeAutoSyncStatus({
        records: recordsWithStatuses(RecordSyncStatus.notModified),
        survey: surveyMergeAllowed,
      }),
    ).toBe(AutoSyncStatus.synced);
  });

  test("conflicting keys need a merge when merging is allowed", () => {
    expect(
      computeAutoSyncStatus({
        records: recordsWithStatuses(RecordSyncStatus.conflictingKeys),
        survey: surveyMergeAllowed,
      }),
    ).toBe(AutoSyncStatus.error);
  });

  test("conflicting keys need a manual fix when merging is not allowed", () => {
    expect(
      computeAutoSyncStatus({
        records: recordsWithStatuses(RecordSyncStatus.conflictingKeys),
        survey: surveyMergeNotAllowed,
      }),
    ).toBe(AutoSyncStatus.needsManualFix);
  });

  test("same record modified on both sides stays mergeable when merging with same keys is not allowed", () => {
    expect(
      computeAutoSyncStatus({
        records: recordsWithStatuses(RecordSyncStatus.modifiedLocallyAndRemotely),
        survey: surveyMergeNotAllowed,
      }),
    ).toBe(AutoSyncStatus.error);
  });

  test("records without keys need a manual fix", () => {
    expect(
      computeAutoSyncStatus({
        records: recordsWithStatuses(RecordSyncStatus.keysNotSpecified),
        survey: surveyMergeAllowed,
      }),
    ).toBe(AutoSyncStatus.needsManualFix);
  });

  test("pending wins over needsManualFix, error wins over pending", () => {
    expect(
      computeAutoSyncStatus({
        records: recordsWithStatuses(
          RecordSyncStatus.keysNotSpecified,
          RecordSyncStatus.new,
        ),
        survey: surveyMergeAllowed,
      }),
    ).toBe(AutoSyncStatus.pending);
    expect(
      computeAutoSyncStatus({
        records: recordsWithStatuses(
          RecordSyncStatus.new,
          RecordSyncStatus.modifiedRemotely,
        ),
        survey: surveyMergeAllowed,
      }),
    ).toBe(AutoSyncStatus.error);
  });
});

describe("hasConflictingKeysWithMergeNotAllowed", () => {
  const records = recordsWithStatuses(RecordSyncStatus.conflictingKeys);

  test("true only when merging with same keys is not allowed", () => {
    expect(
      hasConflictingKeysWithMergeNotAllowed({ records, survey: surveyMergeNotAllowed }),
    ).toBe(true);
    expect(
      hasConflictingKeysWithMergeNotAllowed({ records, survey: surveyMergeAllowed }),
    ).toBe(false);
  });

  test("false without conflicting keys", () => {
    expect(
      hasConflictingKeysWithMergeNotAllowed({
        records: recordsWithStatuses(RecordSyncStatus.keysNotSpecified),
        survey: surveyMergeNotAllowed,
      }),
    ).toBe(false);
  });
});
