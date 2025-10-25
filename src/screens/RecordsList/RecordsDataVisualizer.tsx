import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import PropTypes from "prop-types";

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
  DataVisualizerCellPropTypes,
  Icon,
  LoadingIcon,
  Text,
} from "components";
import { useTranslation } from "localization";
import { Cycles, ScreenViewMode, SortDirection, SurveyDefs } from "model";
import {
  DataEntryActions,
  ScreenOptionsSelectors,
  SurveySelectors,
} from "state";
import { ArrayUtils } from "utils";

import { RecordSyncStatusIcon } from "./RecordSyncStatusIcon";
import { RecordsUtils } from "./RecordsUtils";
import { RecordListConstants } from "./recordListConstants";
import { RecordErrorIcon } from "./RecordErrorIcon";

const formatDateToDateTimeDisplay = (date: any) =>
  typeof date === "string"
    ? Dates.convertDate({
        dateStr: date,
        formatFrom: DateFormats.datetimeStorage,
        formatTo: DateFormats.datetimeDisplay,
      })
    : Dates.format(date, DateFormats.datetimeDisplay);

const RecordOriginTableCellRenderer = ({ item }: any) => (
  <Icon source={RecordListConstants.iconByOrigin[item.origin]} />
);
RecordOriginTableCellRenderer.propTypes = DataVisualizerCellPropTypes;

const RecordOriginListCellRenderer = ({ item }: any) => (
  <Text textKey={`recordsList:origin.${item.origin}`} />
);
RecordOriginListCellRenderer.propTypes = DataVisualizerCellPropTypes;

const RecordLoadStatusTableCellRenderer = ({ item }: any) => (
  <Icon source={RecordListConstants.iconByLoadStatus[item.loadStatus]} />
);
RecordLoadStatusTableCellRenderer.propTypes = DataVisualizerCellPropTypes;

const RecordLoadStatusListCellRenderer = ({ item }: any) => (
  <Text textKey={`recordsList:loadStatus.${item.loadStatus}`} />
);
RecordLoadStatusListCellRenderer.propTypes = DataVisualizerCellPropTypes;

const RecordErrorsListCellRenderer = ({ item }: any) => (
  <Text>{Validations.getErrorsCount(item.validation)}</Text>
);
RecordErrorsListCellRenderer.propTypes = DataVisualizerCellPropTypes;

const RecordWarningsListCellRenderer = ({ item }: any) => (
  <Text>{Validations.getWarningsCount(item.validation)}</Text>
);
RecordWarningsListCellRenderer.propTypes = DataVisualizerCellPropTypes;

export const RecordsDataVisualizer = (props: any) => {
  const {
    onCloneSelectedRecordUuids,
    onDeleteSelectedRecordUuids,
    onExportSelectedRecordUuids,
    onImportSelectedRecordUuids,
    records,
    showRemoteProps,
    syncStatusFetched,
    syncStatusLoading,
  } = props;

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const survey = SurveySelectors.useCurrentSurvey();
  const cycle = SurveySelectors.useCurrentSurveyCycle();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const defaultCycleKey = Surveys.getDefaultCycleKey(survey);
  const isPrevCycle = Cycles.isPreviousCycle({
    defaultCycleKey,
    cycleKey: cycle,
  });

  const screenViewMode = ScreenOptionsSelectors.useCurrentScreenViewMode();
  const viewAsList = screenViewMode === ScreenViewMode.list;
  const [selectedRecordUuids, setSelectedRecordUuids] = useState([]);
  const [sort, setSort] = useState({ dateModified: SortDirection.desc });

  // reset selected record uuids on records change
  useEffect(() => {
    setSelectedRecordUuids([]);
  }, [records]);

  const recordsHaveErrorsOrWarnings = useMemo(
    () =>
      records.some((r: any) => {
        const validation = Validations.getValidation(r);
        return (
          Validations.getErrorsCount(validation) ||
          Validations.getWarningsCount(validation)
        );
      }),
    [records]
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
      const valuesByKey = RecordsUtils.getValuesByKeyFormatted({
        survey,
        lang,
        recordSummary,
        t,
      });
      const valuesBySummaryAttribute =
        RecordsUtils.getValuesBySummaryAttributeFormatted({
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
          recordSummary.dateModifiedRemote
        ),
        dateSynced: formatDateToDateTimeDisplay(recordSummary.dateSynced),
      };
    },
    [lang, survey, t]
  );

  const recordItems = useMemo(() => {
    const items = records.map(recordToItem);
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
        }) as never
      );
    },
    [dispatch, navigation]
  );

  const fields = useMemo(() => {
    const result = [];
    result.push(
      ...rootKeyDefs.map((keyDef) => ({
        key: `keysObj.${NodeDefs.getName(keyDef)}`,
        header: NodeDefs.getLabelOrName(keyDef, lang),
        headerLabelVariant: "titleMedium",
        sortable: true,
        textVariant: "titleLarge",
      })),
      ...rootSummaryDefs.map((keyDef) => ({
        key: `summaryAttributesObj.${NodeDefs.getName(keyDef)}`,
        header: NodeDefs.getLabelOrName(keyDef, lang),
        headerLabelVariant: "titleMedium",
        sortable: true,
        textVariant: "titleLarge",
      }))
    );
    if (recordsHaveErrorsOrWarnings) {
      result.push({
        key: "errors",
        header: "common:error_other",
        sortable: true,
        style: viewAsList ? undefined : { maxWidth: 54 },
        cellRenderer: viewAsList
          ? RecordErrorsListCellRenderer
          : RecordErrorIcon,
      });
    }
    if (viewAsList) {
      if (recordsHaveErrorsOrWarnings) {
        result.push({
          key: "warnings",
          header: "common:warning_other",
          optional: true,
          cellRenderer: RecordWarningsListCellRenderer,
        });
      }
      result.push(
        {
          key: "dateModified",
          header: "common:modifiedOn",
          optional: true,
          sortable: true,
          style: { minWidth: 50 },
        },
        {
          key: "dateCreated",
          header: "common:createdOn",
          optional: true,
        }
      );
    }
    if (showRemoteProps) {
      result.push({
        key: "origin",
        header: "recordsList:origin.title",
        style: { minWidth: 10 },
        cellRenderer: viewAsList
          ? RecordOriginListCellRenderer
          : RecordOriginTableCellRenderer,
      });
      if (viewAsList) {
        result.push(
          {
            key: "dateModifiedRemote",
            header: "recordsList:dateModifiedRemotely",
          },
          { key: "ownerName", header: "recordsList:owner" }
        );
      }
      result.push({
        key: "loadStatus",
        header: "recordsList:loadStatus.title",
        style: { minWidth: 10 },
        cellRenderer: viewAsList
          ? RecordLoadStatusListCellRenderer
          : RecordLoadStatusTableCellRenderer,
      });
    }
    if (syncStatusLoading || syncStatusFetched) {
      result.push({
        key: "syncStatus",
        header: "common:status",
        cellRenderer: syncStatusLoading ? LoadingIcon : RecordSyncStatusIcon,
        style: viewAsList ? undefined : { maxWidth: 50 },
      });
    }
    if (syncStatusFetched && viewAsList) {
      result.push({
        key: "dateSynced",
        header: "dataEntry:syncedOn",
        headerWidth: 80,
        style: { minWidth: 50 },
      });
    }
    return result;
  }, [
    rootKeyDefs,
    rootSummaryDefs,
    recordsHaveErrorsOrWarnings,
    viewAsList,
    showRemoteProps,
    syncStatusLoading,
    syncStatusFetched,
    lang,
  ]);

  const onSelectionChange = useCallback((selection: any) => {
    setSelectedRecordUuids(selection);
  }, []);

  const onImportSelectedItems = useCallback(() => {
    onImportSelectedRecordUuids(selectedRecordUuids);
  }, [selectedRecordUuids, onImportSelectedRecordUuids]);

  const onCloneSelectedItems = useCallback(() => {
    onCloneSelectedRecordUuids(selectedRecordUuids);
  }, [selectedRecordUuids, onCloneSelectedRecordUuids]);

  const onExportSelectedItems = useCallback(() => {
    onExportSelectedRecordUuids(selectedRecordUuids);
  }, [selectedRecordUuids, onExportSelectedRecordUuids]);

  const onSortChange = useCallback((sortNext: any) => {
    setSort(sortNext);
  }, []);

  const customActions = useMemo(() => {
    const actions = [];
    if (isPrevCycle) {
      actions.push({
        key: "cloneSelectedItems",
        icon: "content-copy",
        labelKey: "recordsList:cloneRecords.title",
        onPress: onCloneSelectedItems,
      });
    }
    actions.push({
      key: "importSelectedItems",
      icon: "import",
      labelKey: "recordsList:importRecords.title",
      onPress: onImportSelectedItems,
    });
    if (syncStatusFetched) {
      actions.push({
        key: "exportSelectedItems",
        icon: "download-outline",
        labelKey: "recordsList:exportRecords.title",
        onPress: onExportSelectedItems,
      });
    }
    return actions;
  }, [
    isPrevCycle,
    onCloneSelectedItems,
    onExportSelectedItems,
    onImportSelectedItems,
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

RecordsDataVisualizer.propTypes = {
  onCloneSelectedRecordUuids: PropTypes.func.isRequired,
  onDeleteSelectedRecordUuids: PropTypes.func.isRequired,
  onExportSelectedRecordUuids: PropTypes.func.isRequired,
  onImportSelectedRecordUuids: PropTypes.func.isRequired,
  records: PropTypes.array.isRequired,
  showRemoteProps: PropTypes.bool,
  syncStatusFetched: PropTypes.bool,
  syncStatusLoading: PropTypes.bool,
};
