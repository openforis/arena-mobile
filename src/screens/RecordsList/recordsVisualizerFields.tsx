import {
  DateFormats,
  Dates,
  NodeDefs,
  Validations,
} from "@openforis/arena-core";

import {
  DataVisualizerCellProps,
  DataVisualizerCellRenderer,
  DataVisualizerField,
  Icon,
  LoadingIcon,
  Text,
} from "components";
import { RecordLoadStatus, RecordOrigin, ScreenViewMode } from "model";

import { RecordErrorIcon } from "./RecordErrorIcon";
import { RecordReadOnlyIcon } from "./RecordReadOnlyIcon";
import { RecordSyncStatusIcon } from "./RecordSyncStatusIcon";
import { RecordValidationBadge } from "./RecordValidationBadge";
import { RecordListConstants } from "./recordListConstants";

export const formatDateToDateTimeDisplay = (date: any) =>
  typeof date === "string"
    ? Dates.convertDate({
        dateStr: date,
        formatFrom: DateFormats.datetimeStorage,
        formatTo: DateFormats.datetimeDisplay,
      })
    : Dates.format(date, DateFormats.datetimeDisplay);

const RecordOriginCellRenderer = ({ item }: DataVisualizerCellProps) => (
  <Icon
    source={RecordListConstants.iconByOrigin[item.origin as RecordOrigin]}
  />
);

const RecordLoadStatusCellRenderer = ({ item }: DataVisualizerCellProps) => (
  <Icon
    source={
      RecordListConstants.iconByLoadStatus[item.loadStatus as RecordLoadStatus]
    }
  />
);

const LoadingIconCellRenderer = (_props: DataVisualizerCellProps) => (
  <LoadingIcon />
);

const getSyncStatusCellRenderer = ({
  syncStatusLoading,
}: {
  syncStatusLoading?: boolean;
}): DataVisualizerCellRenderer =>
  syncStatusLoading ? LoadingIconCellRenderer : RecordSyncStatusIcon;

const RecordErrorsListCellRenderer = ({ item }: DataVisualizerCellProps) => (
  <Text>{Validations.getErrorsCount(item.validation)}</Text>
);

const RecordWarningsListCellRenderer = ({ item }: DataVisualizerCellProps) => (
  <Text>{Validations.getWarningsCount(item.validation)}</Text>
);

export const buildKeySummaryFields = ({
  rootKeyDefs,
  rootSummaryDefs,
  lang,
}: any): DataVisualizerField[] => [
  ...rootKeyDefs.map((keyDef: any) => ({
    key: `keysObj.${NodeDefs.getName(keyDef)}`,
    cardRole: "title" as const,
    cardShowLabel: true,
    header: NodeDefs.getLabelOrName(keyDef, lang),
    sortable: true,
  })),
  // optional: in a narrow table they move to the expanded row
  ...rootSummaryDefs.map((keyDef: any) => ({
    key: `summaryAttributesObj.${NodeDefs.getName(keyDef)}`,
    header: NodeDefs.getLabelOrName(keyDef, lang),
    optional: true,
    sortable: true,
  })),
];

export const buildErrorsField = ({
  recordsHaveErrorsOrWarnings,
  screenViewMode,
}: {
  recordsHaveErrorsOrWarnings: boolean;
  screenViewMode: ScreenViewMode;
}): DataVisualizerField[] =>
  recordsHaveErrorsOrWarnings
    ? [
        {
          key: "errors",
          cardRole: "badge",
          header: "common:error_other",
          sortable: true,
          style: { maxWidth: 54 },
          cellRenderer:
            screenViewMode === ScreenViewMode.cards
              ? RecordValidationBadge
              : RecordErrorIcon,
        },
      ]
    : [];

// warnings count, and the modified/created dates, are shown only in the expanded row in table
// view - it's too narrow for them
export const buildDetailFields = ({
  screenViewMode,
  recordsHaveErrorsOrWarnings,
}: {
  screenViewMode: ScreenViewMode;
  recordsHaveErrorsOrWarnings: boolean;
}): DataVisualizerField[] => {
  const result: DataVisualizerField[] = [];
  // the table errors column shows just an icon: show the counts in the expanded row
  if (recordsHaveErrorsOrWarnings && screenViewMode === ScreenViewMode.table) {
    result.push({
      key: "errorsCount",
      header: "common:error_other",
      tableDetail: true,
      cellRenderer: RecordErrorsListCellRenderer,
    });
  }
  // cards already show the warnings count in the validation badge
  if (recordsHaveErrorsOrWarnings && screenViewMode !== ScreenViewMode.cards) {
    result.push({
      key: "warnings",
      header: "common:warning_other",
      tableDetail: true,
      cellRenderer: RecordWarningsListCellRenderer,
    });
  }
  result.push(
    {
      key: "dateModified",
      cardRole: "footer",
      header: "common:modifiedOn",
      sortable: true,
      tableDetail: true,
    },
    {
      key: "dateCreated",
      cardRole: "footer",
      header: "common:createdOn",
      tableDetail: true,
    },
  );
  return result;
};

export const buildRemoteFields = ({
  showRemoteProps,
}: {
  showRemoteProps?: boolean;
}): DataVisualizerField[] => {
  if (!showRemoteProps) return [];
  return [
    {
      key: "origin",
      cardRole: "badge",
      header: "recordsList:origin.title",
      style: { minWidth: 10 },
      cellRenderer: RecordOriginCellRenderer,
    },
    {
      key: "dateModifiedRemote",
      cardRole: "footer",
      header: "recordsList:dateModifiedRemotely",
      tableDetail: true,
    },
    {
      key: "ownerName",
      cardRole: "footer",
      header: "recordsList:owner",
      tableDetail: true,
    },
    {
      key: "loadStatus",
      cardRole: "badge",
      header: "recordsList:loadStatus.title",
      style: { minWidth: 10 },
      cellRenderer: RecordLoadStatusCellRenderer,
    },
  ];
};

export const buildReadOnlyFields = ({
  recordsHaveReadOnly,
}: {
  recordsHaveReadOnly: boolean;
}): DataVisualizerField[] =>
  recordsHaveReadOnly
    ? [
        {
          key: "readOnly",
          header: "recordsList:readOnly",
          cellRenderer: RecordReadOnlyIcon,
          style: { maxWidth: 24 },
        },
      ]
    : [];

export const buildSyncStatusFields = ({
  syncStatusLoading,
  syncStatusFetched,
}: any): DataVisualizerField[] => {
  const result: DataVisualizerField[] = [];
  if (syncStatusLoading || syncStatusFetched) {
    result.push({
      key: "syncStatus",
      cardRole: "badge",
      header: "common:status",
      headerIcon: "sync",
      cellRenderer: getSyncStatusCellRenderer({ syncStatusLoading }),
      style: { maxWidth: 24 },
    });
  }
  if (syncStatusFetched) {
    result.push({
      key: "dateSynced",
      cardRole: "footer",
      header: "dataEntry:syncedOn",
      headerWidth: 80,
      tableDetail: true,
    });
  }
  return result;
};
