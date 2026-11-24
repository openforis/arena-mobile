import {
  ArenaAnyNodeDef,
  DateFormats,
  Dates,
  LanguageCode,
  NodeDefs,
  ArenaValidation,
  Validations,
} from "@openforis/arena-core";

import {
  DataVisualizerCellProps,
  DataVisualizerCellRenderer,
  DataVisualizerField,
  DataVisualizerItem,
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

// record summary as shown in the records list (only the props read by the cell renderers)
export type RecordListItem = DataVisualizerItem & {
  id?: number;
  uuid: string;
  loadStatus?: RecordLoadStatus;
  origin?: RecordOrigin;
  readOnly?: boolean;
  syncStatus?: string;
  validation?: ArenaValidation;
};

export type RecordListField = DataVisualizerField<RecordListItem>;
type RecordListCellProps = DataVisualizerCellProps<RecordListItem>;

export const formatDateToDateTimeDisplay = (
  date: string | number | Date | undefined,
) =>
  typeof date === "string"
    ? Dates.convertDate({
        dateStr: date,
        formatFrom: DateFormats.datetimeStorage,
        formatTo: DateFormats.datetimeDisplay,
      })
    : Dates.format(date, DateFormats.datetimeDisplay);

const RecordOriginCellRenderer = ({ item }: RecordListCellProps) => (
  <Icon
    source={RecordListConstants.iconByOrigin[item.origin as RecordOrigin]}
  />
);

const RecordLoadStatusCellRenderer = ({ item }: RecordListCellProps) => (
  <Icon
    source={
      RecordListConstants.iconByLoadStatus[item.loadStatus as RecordLoadStatus]
    }
  />
);

const LoadingIconCellRenderer = (_props: RecordListCellProps) => (
  <LoadingIcon />
);

const getSyncStatusCellRenderer = ({
  syncStatusLoading,
}: {
  syncStatusLoading?: boolean;
}): DataVisualizerCellRenderer<RecordListItem> =>
  syncStatusLoading ? LoadingIconCellRenderer : RecordSyncStatusIcon;

const RecordErrorsListCellRenderer = ({ item }: RecordListCellProps) => (
  <Text>{Validations.getErrorsCount(item.validation!)}</Text>
);

const RecordWarningsListCellRenderer = ({ item }: RecordListCellProps) => (
  <Text>{Validations.getWarningsCount(item.validation!)}</Text>
);

export const buildKeySummaryFields = ({
  rootKeyDefs,
  rootSummaryDefs,
  lang,
}: {
  rootKeyDefs: ArenaAnyNodeDef[];
  rootSummaryDefs: ArenaAnyNodeDef[];
  lang: LanguageCode;
}): RecordListField[] => [
  ...rootKeyDefs.map((keyDef) => ({
    key: `keysObj.${NodeDefs.getName(keyDef)}`,
    cardRole: "title" as const,
    cardShowLabel: true,
    header: NodeDefs.getLabelOrName(keyDef, lang),
    sortable: true,
  })),
  // optional: in a narrow table they move to the expanded row
  ...rootSummaryDefs.map((keyDef) => ({
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
}): RecordListField[] =>
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
}): RecordListField[] => {
  const result: RecordListField[] = [];
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
}): RecordListField[] => {
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
}): RecordListField[] =>
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
}: {
  syncStatusLoading?: boolean;
  syncStatusFetched?: boolean;
}): RecordListField[] => {
  const result: RecordListField[] = [];
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
