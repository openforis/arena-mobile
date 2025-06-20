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
} from "@openforis/arena-core";

import {
  DataVisualizer,
  DataVisualizerCellPropTypes,
  Icon,
  LoadingIcon,
  Text,
} from "components";
import { useTranslation } from "localization";
import {
  Cycles,
  RecordLoadStatus,
  RecordOrigin,
  ScreenViewMode,
  SortDirection,
  SurveyDefs,
} from "model";
import {
  DataEntryActions,
  ScreenOptionsSelectors,
  SurveySelectors,
} from "state";
import { ArrayUtils } from "utils";

import { RecordSyncStatusIcon } from "./RecordSyncStatusIcon";
import { RecordsUtils } from "./RecordsUtils";

const iconByLoadStatus = {
  [RecordLoadStatus.complete]: "circle-slice-8",
  [RecordLoadStatus.partial]: "circle-slice-4",
  [RecordLoadStatus.summary]: "circle-outline",
};

const iconByOrigin = {
  [RecordOrigin.local]: "cellphone",
  [RecordOrigin.remote]: "cloud-outline",
};

const formatDateToDateTimeDisplay = (date) =>
  typeof date === "string"
    ? Dates.convertDate({
        dateStr: date,
        formatFrom: DateFormats.datetimeStorage,
        formatTo: DateFormats.datetimeDisplay,
      })
    : Dates.format(date, DateFormats.datetimeDisplay);

const RecordOriginTableCellRenderer = ({ item }) => (
  <Icon source={iconByOrigin[item.origin]} />
);
RecordOriginTableCellRenderer.propTypes = DataVisualizerCellPropTypes;

const RecordOriginListCellRenderer = ({ item }) => (
  <Text textKey={`recordsList:origin.${item.origin}`} />
);

RecordOriginListCellRenderer.propTypes = DataVisualizerCellPropTypes;

const RecordLoadStatusTableCellRenderer = ({ item }) => (
  <Icon source={iconByLoadStatus[item.loadStatus]} />
);
RecordLoadStatusTableCellRenderer.propTypes = DataVisualizerCellPropTypes;

const RecordLoadStatusListCellRenderer = ({ item }) => (
  <Text textKey={`recordsList:loadStatus.${item.loadStatus}`} />
);

RecordLoadStatusListCellRenderer.propTypes = DataVisualizerCellPropTypes;

export const RecordsDataVisualizer = (props) => {
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

  const rootDefKeys = useMemo(
    () => (survey ? SurveyDefs.getRootKeyDefs({ survey, cycle }) : []),
    [survey, cycle]
  );

  const recordToItem = useCallback(
    (recordSummary) => {
      const valuesByKey = RecordsUtils.getValuesByKeyFormatted({
        survey,
        lang,
        recordSummary,
        t,
      });
      return {
        ...recordSummary,
        key: recordSummary.uuid,
        ...valuesByKey,
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
    (recordSummary) => {
      dispatch(
        DataEntryActions.fetchAndEditRecord({ navigation, recordSummary })
      );
    },
    [dispatch, navigation]
  );

  const fields = useMemo(() => {
    const result = [];
    result.push(
      ...rootDefKeys.map((keyDef) => ({
        key: Objects.camelize(NodeDefs.getName(keyDef)),
        header: NodeDefs.getLabelOrName(keyDef, lang),
        headerLabelVariant: "titleMedium",
        sortable: true,
        textVariant: "titleLarge",
      })),
      {
        key: "dateModified",
        header: "common:modifiedOn",
        optional: true,
        sortable: true,
        style: { minWidth: 50 },
      }
    );
    if (viewAsList) {
      result.push({
        key: "dateCreated",
        header: "common:createdOn",
        optional: true,
      });
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
    rootDefKeys,
    showRemoteProps,
    syncStatusLoading,
    syncStatusFetched,
    viewAsList,
    lang,
  ]);

  const onSelectionChange = useCallback((selection) => {
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

  const onSortChange = useCallback((sortNext) => {
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
