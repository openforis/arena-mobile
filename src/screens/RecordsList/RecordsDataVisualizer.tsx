import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  DateFormats,
  Dates,
  NodeDefs,
  Objects,
  Surveys,
  Validations,
} from "@openforis/arena-core";

import {
  DataVisualizer,
  DataVisualizerCellProps,
  DataVisualizerCellRenderer,
  DataVisualizerField,
  Icon,
  LoadingIcon,
  SelectedItemsAction,
  Text,
} from "components";
import { useTranslation } from "localization";
import {
  Cycles,
  RecordLoadStatus,
  RecordOrigin,
  RecordUtils,
  ScreenViewMode,
  Sort,
  SurveyDefs,
} from "model";
import {
  DataEntryActions,
  ScreenOptionsSelectors,
  SurveySelectors,
  useAppDispatch,
} from "state";
import { ArrayUtils } from "utils";

import { RecordErrorIcon } from "./RecordErrorIcon";
import { RecordSyncStatusIcon } from "./RecordSyncStatusIcon";
import { RecordValidationBadge } from "./RecordValidationBadge";
import { RecordListConstants } from "./recordListConstants";

const formatDateToDateTimeDisplay = (date: any) =>
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

const buildKeySummaryFields = ({
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

const buildErrorsField = ({
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
const buildDetailFields = ({
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

const buildRemoteFields = ({
  showRemoteProps,
}: {
  showRemoteProps?: boolean;
}): DataVisualizerField[] => {
  if (!showRemoteProps) return [];
  const result: DataVisualizerField[] = [
    {
      key: "origin",
      cardRole: "badge",
      header: "recordsList:origin.title",
      style: { minWidth: 10 },
      cellRenderer:
        RecordOriginCellRenderer,
    },
  ];
  result.push(
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
  );
  result.push({
    key: "loadStatus",
    cardRole: "badge",
    header: "recordsList:loadStatus.title",
    style: { minWidth: 10 },
    cellRenderer:
      RecordLoadStatusCellRenderer,
  });
  return result;
};

const buildSyncStatusFields = ({
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

type RecordsDataVisualizerProps = {
  onCloneSelectedRecordUuids: (uuids: string[]) => void;
  onDeleteSelectedRecordUuids: (uuids: string[]) => void;
  onExportSelectedRecordUuids: (uuids: string[]) => void;
  onFetchSelectedRecordUuids: (uuids: string[]) => void;
  onRevalidateSelectedRecordUuids: (uuids: string[]) => void;
  onSelectedRecordUuidsChange?: (uuids: string[]) => void;
  records: any[];
  showRemoteProps?: boolean;
  syncStatusFetched?: boolean;
  syncStatusLoading?: boolean;
};

export const RecordsDataVisualizer = (props: RecordsDataVisualizerProps) => {
  const {
    onCloneSelectedRecordUuids,
    onDeleteSelectedRecordUuids,
    onExportSelectedRecordUuids,
    onFetchSelectedRecordUuids,
    onRevalidateSelectedRecordUuids,
    onSelectedRecordUuidsChange,
    records,
    showRemoteProps,
    syncStatusFetched,
    syncStatusLoading,
  } = props;

  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const survey = SurveySelectors.useCurrentSurvey()!;
  const cycle = SurveySelectors.useCurrentSurveyCycle();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const defaultCycleKey = Surveys.getDefaultCycleKey(survey);
  const isPrevCycle = Cycles.isPreviousCycle({
    defaultCycleKey,
    cycleKey: cycle,
  });
  // records are cloned into the default cycle: from the previous cycle or within the default cycle itself
  const canCloneRecords = isPrevCycle || cycle === defaultCycleKey;

  const screenViewMode = ScreenOptionsSelectors.useCurrentScreenViewMode();
  const [selectedRecordUuids, setSelectedRecordUuids] = useState([]);
  const [sort, setSort] = useState({ dateModified: Sort.desc });

  // reset selected record uuids on records change
  useEffect(() => {
    setSelectedRecordUuids([]);
    onSelectedRecordUuidsChange?.([]);
  }, [records, onSelectedRecordUuidsChange]);

  const recordsHaveErrorsOrWarnings = useMemo(
    () =>
      records.some((r: any) => {
        const validation = Validations.getValidation(r);
        return (
          Validations.getErrorsCount(validation) ||
          Validations.getWarningsCount(validation)
        );
      }),
    [records],
  );

  const rootKeyDefs = useMemo(() => {
    if (!survey) return [];
    return SurveyDefs.getRootKeyDefs({ survey, cycle });
  }, [survey, cycle]);

  const rootSummaryDefs = useMemo(() => {
    if (!survey) return [];
    const rootDef = Surveys.getNodeDefRoot({ survey });
    const summaryDefs = Surveys.getNodeDefsIncludedInMultipleEntitySummary({
      survey,
      cycle,
      nodeDef: rootDef,
    });
    return summaryDefs;
  }, [survey, cycle]);

  const recordToItem = useCallback(
    (recordSummary: any) => {
      const valuesByKey = RecordUtils.getRecordSummaryValuesByKeyFormatted({
        survey,
        lang,
        recordSummary,
        t,
      });
      const valuesBySummaryAttribute =
        RecordUtils.getRecordSummaryValuesBySummaryAttributeFormatted({
          survey,
          lang,
          recordSummary,
          t,
        });
      return {
        ...recordSummary,
        key: recordSummary.uuid,
        keysObj: valuesByKey,
        summaryAttributesObj: valuesBySummaryAttribute,
        dateCreated: formatDateToDateTimeDisplay(recordSummary.dateCreated),
        dateModified: formatDateToDateTimeDisplay(recordSummary.dateModified),
        dateModifiedRemote: formatDateToDateTimeDisplay(
          recordSummary.dateModifiedRemote,
        ),
        dateSynced: formatDateToDateTimeDisplay(recordSummary.dateSynced),
      };
    },
    [lang, survey, t],
  );

  const recordItems = useMemo(() => {
    const items = records.map((record) => recordToItem(record));
    if (!Objects.isEmpty(sort)) {
      ArrayUtils.sortByProps(sort)(items);
    }
    return items;
  }, [records, recordToItem, sort]);

  const onItemPress = useCallback(
    (recordSummary: any) => {
      dispatch(
        DataEntryActions.fetchAndEditRecord({
          navigation,
          recordSummary,
        }),
      );
    },
    [dispatch, navigation],
  );

  const fields = useMemo(
    (): DataVisualizerField[] => [
      ...buildKeySummaryFields({ rootKeyDefs, rootSummaryDefs, lang }),
      ...buildErrorsField({
        recordsHaveErrorsOrWarnings,
        screenViewMode,
      }),
      ...buildDetailFields({ screenViewMode, recordsHaveErrorsOrWarnings }),
      ...buildRemoteFields({ showRemoteProps }),
      ...buildSyncStatusFields({
        syncStatusLoading,
        syncStatusFetched,
      }),
    ],
    [
      lang,
      recordsHaveErrorsOrWarnings,
      rootKeyDefs,
      rootSummaryDefs,
      screenViewMode,
      showRemoteProps,
      syncStatusFetched,
      syncStatusLoading,
    ],
  );

  const onSelectionChange = useCallback(
    (selection: any) => {
      setSelectedRecordUuids(selection);
      onSelectedRecordUuidsChange?.(selection);
    },
    [onSelectedRecordUuidsChange],
  );

  const onFetchSelectedItems = useCallback(() => {
    onFetchSelectedRecordUuids(selectedRecordUuids);
  }, [selectedRecordUuids, onFetchSelectedRecordUuids]);

  const onCloneSelectedItems = useCallback(() => {
    onCloneSelectedRecordUuids(selectedRecordUuids);
  }, [selectedRecordUuids, onCloneSelectedRecordUuids]);

  const onExportSelectedItems = useCallback(() => {
    onExportSelectedRecordUuids(selectedRecordUuids);
  }, [selectedRecordUuids, onExportSelectedRecordUuids]);

  const onRevalidateSelectedItems = useCallback(() => {
    onRevalidateSelectedRecordUuids(selectedRecordUuids);
  }, [selectedRecordUuids, onRevalidateSelectedRecordUuids]);

  const onSortChange = useCallback((sortNext: any) => {
    setSort(sortNext);
  }, []);

  const customActions = useMemo(() => {
    const actions: SelectedItemsAction[] = [];
    if (canCloneRecords) {
      actions.push({
        key: "cloneSelectedItems",
        icon: "content-copy",
        labelKey: "recordsList:cloneRecords.title",
        onPress: onCloneSelectedItems,
      });
    }
    actions.push({
      key: "fetchSelectedItems",
      icon: "import",
      labelKey: "recordsList:fetchRecords.title",
      onPress: onFetchSelectedItems,
    });
    if (syncStatusFetched) {
      actions.push({
        key: "exportSelectedItems",
        icon: "download-outline",
        labelKey: "recordsList:exportRecords.title",
        onPress: onExportSelectedItems,
      });
    }
    actions.push({
      key: "revalidateSelectedItems",
      icon: "clipboard-check-outline",
      labelKey: "recordsList:revalidateRecords.title",
      onPress: onRevalidateSelectedItems,
    });
    return actions;
  }, [
    canCloneRecords,
    onCloneSelectedItems,
    onExportSelectedItems,
    onFetchSelectedItems,
    onRevalidateSelectedItems,
    syncStatusFetched,
  ]);

  return (
    <DataVisualizer
      fields={fields}
      mode={screenViewMode}
      items={recordItems}
      onItemPress={onItemPress}
      onDeleteSelectedItemIds={onDeleteSelectedRecordUuids}
      onSelectionChange={onSelectionChange}
      onSortChange={onSortChange}
      selectable
      selectedItemIds={selectedRecordUuids}
      selectedItemsCustomActions={customActions}
      sort={sort}
    />
  );
};
