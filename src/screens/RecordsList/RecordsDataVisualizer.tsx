import { useNavigator } from "navigation/navigator";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Objects, Surveys, Validations } from "@openforis/arena-core";

import { DataVisualizer, SelectedItemsAction } from "components";
import { useTranslation } from "localization";
import { Cycles, RecordUtils, Sort, SortObject, SurveyDefs } from "model";
import {
  DataEntryActions,
  RemoteConnectionSelectors,
  ScreenOptionsSelectors,
  SurveySelectors,
  useAppDispatch,
} from "state";
import { ArrayUtils } from "utils";

import {
  buildDetailFields,
  buildErrorsField,
  buildKeySummaryFields,
  buildReadOnlyFields,
  buildRemoteFields,
  buildSyncStatusFields,
  formatDateToDateTimeDisplay,
  RecordListField,
  RecordListItem,
} from "./recordsVisualizerFields";
import type { RecordSummaryWithSyncStatus } from "./recordsListTypes";

// table view only: the list and cards views are virtualized
const recordsPerPage = 50;

type RecordsDataVisualizerProps = {
  onCloneSelectedRecordUuids: (uuids: string[]) => void;
  onDeleteSelectedRecordUuids: (uuids: string[]) => void;
  onExportSelectedRecordUuids: (uuids: string[]) => void;
  onFetchSelectedRecordUuids: (uuids: string[]) => void;
  onRevalidateSelectedRecordUuids: (uuids: string[]) => void;
  onSelectedRecordUuidsChange?: (uuids: string[]) => void;
  records: RecordSummaryWithSyncStatus[];
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
  const navigator = useNavigator();
  const { t } = useTranslation();

  const survey = SurveySelectors.useCurrentSurvey()!;
  const cycle = SurveySelectors.useCurrentSurveyCycle()!;
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const defaultCycleKey = Surveys.getDefaultCycleKey(survey);
  const isPrevCycle = Cycles.isPreviousCycle({
    defaultCycleKey,
    cycleKey: cycle,
  });
  const canCreateRecords =
    RemoteConnectionSelectors.useLoggedInUserCanCreateRecords();
  // records are cloned into the default cycle: from the previous cycle or within the default cycle itself
  const canCloneRecords =
    canCreateRecords && (isPrevCycle || cycle === defaultCycleKey);

  const screenViewMode = ScreenOptionsSelectors.useCurrentScreenViewMode();
  const [selectedRecordUuids, setSelectedRecordUuids] = useState<string[]>([]);
  const [sort, setSort] = useState<SortObject>({ dateModified: Sort.desc });

  const recordsHaveReadOnly = useMemo(
    () => records.some((r) => r.readOnly),
    [records],
  );

  const recordsHaveErrorsOrWarnings = useMemo(
    () =>
      records.some((r) => {
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
    (recordSummary: RecordSummaryWithSyncStatus) => {
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
        // sort value for the "errors" field (its cell renderers read the validation)
        errors: Validations.getErrorsCount(
          Validations.getValidation(recordSummary),
        ),
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
    (recordSummary: RecordListItem) => {
      dispatch(
        DataEntryActions.fetchAndEditRecord({
          navigator,
          recordSummary,
        }),
      );
    },
    [dispatch, navigator],
  );

  const fields = useMemo(
    (): RecordListField[] => [
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
      ...buildReadOnlyFields({ recordsHaveReadOnly }),
    ],
    [
      lang,
      recordsHaveErrorsOrWarnings,
      recordsHaveReadOnly,
      rootKeyDefs,
      rootSummaryDefs,
      screenViewMode,
      showRemoteProps,
      syncStatusFetched,
      syncStatusLoading,
    ],
  );

  const onSelectionChange = useCallback(
    (selection: string[]) => {
      setSelectedRecordUuids(selection);
      onSelectedRecordUuidsChange?.(selection);
    },
    [onSelectedRecordUuidsChange],
  );

  // records are refreshed often (focus, sync status checks): keep the selection, dropping only uuids no longer listed
  const [recordsPrev, setRecordsPrev] = useState(records);
  if (records !== recordsPrev) {
    setRecordsPrev(records);
    const selectionPruned = selectedRecordUuids.filter((uuid) =>
      records.some((record) => record.uuid === uuid),
    );
    if (selectionPruned.length !== selectedRecordUuids.length) {
      setSelectedRecordUuids(selectionPruned);
    }
  }

  // the parent keeps its own copy of the selection: notify it of the pruned one too
  useEffect(() => {
    onSelectedRecordUuidsChange?.(selectedRecordUuids);
  }, [onSelectedRecordUuidsChange, selectedRecordUuids]);

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

  const onSortChange = useCallback((sortNext: SortObject) => {
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
      itemsPerPage={recordsPerPage}
      onItemPress={onItemPress}
      onDeleteSelectedItemIds={onDeleteSelectedRecordUuids}
      onSelectionChange={onSelectionChange}
      onSortChange={onSortChange}
      selectable
      selectedItemIds={selectedRecordUuids}
      selectedItemsCustomActions={customActions}
      showPagination={recordItems.length > recordsPerPage}
      sort={sort}
    />
  );
};
