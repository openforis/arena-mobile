import { RecordUpdateConflictResolutionStrategy as ConflictResolutionStrategy } from "model";

export const minRecordsToShowSearchBar = 5;

export const noRecordsToExportTextKey =
  "dataEntry:dataExport.noRecordsInDeviceToExport";

export const dataImportOptions = {
  overwriteExistingRecords: "overwriteExistingRecords",
};

export const importFileExtension = "zip";

export const conflictingRecordsExportOptions = [
  {
    value: ConflictResolutionStrategy.overwriteIfUpdated,
    label: "dataEntry:dataExport.onlyNewOrUpdatedRecords",
  },
  {
    value: ConflictResolutionStrategy.merge,
    label: "dataEntry:dataExport.mergeConflictingRecords",
  },
];

export const generateRecordsCountSummaryText = ({
  recordsCountSummary,
  t,
}: {
  recordsCountSummary: Record<string, number>;
  t: (key: string) => string;
}) =>
  Object.entries(recordsCountSummary)
    .filter(([_key, value]) => value > 0) // exclude items with 0 count
    .map(([key, value]) => {
      const statusText = t(`dataEntry:recordStatus.${key}`);
      return `${value}: ${statusText}`;
    })
    .join("\n");
