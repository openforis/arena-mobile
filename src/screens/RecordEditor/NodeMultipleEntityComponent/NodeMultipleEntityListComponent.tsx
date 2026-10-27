import { useCallback, useMemo, useState } from "react";

import { NodeDefs, Objects, Records } from "@openforis/arena-core";

import {
  Button,
  DataTable,
  DataVisualizerField,
  HView,
  Text,
  View,
  VView,
} from "components";
import { useTranslation } from "localization";
import { SortObject } from "model";
import { RecordUtils } from "model/utils/RecordUtils";
import {
  DataEntryActions,
  DataEntrySelectors,
  DeviceInfoSelectors,
  SurveyOptionsActions,
  SurveyOptionsSelectors,
  SurveySelectors,
  useAppDispatch,
  useConfirm,
} from "state";
import { ArrayUtils, log } from "utils";

import { NewNodeButton } from "../NewNodeButton";
import { EntityListColumnsDialog } from "./EntityListColumnsDialog";
import { NodeValidationIcon } from "../NodeValidationIcon";

import styles from "./styles";

const determineMaxSummaryDefs = ({
  isDrawerOpen,
  isTablet,
  isLandscape,
}: any) => {
  const result = isTablet && !isDrawerOpen ? 5 : 3;
  return isLandscape ? result + 2 : result;
};

// in landscape all columns are shown by default, unless they are too many
const maxDefaultLandscapeColumns = 10;

type NodeMultipleEntityListComponentProps = {
  entityDef: any;
  parentEntityUuid?: string;
};

export const NodeMultipleEntityListComponent = (
  props: NodeMultipleEntityListComponentProps,
) => {
  const { entityDef, parentEntityUuid } = props;

  const dispatch = useAppDispatch();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const confirm = useConfirm();
  const { t } = useTranslation();
  const [sort, setSort] = useState(undefined as SortObject | undefined);
  const [columnsDialogVisible, setColumnsDialogVisible] = useState(false);

  log.debug(
    "rendering NodeMultipleEntityListComponent for " +
      NodeDefs.getName(entityDef),
  );

  const entityDefUuid = entityDef.uuid;
  const survey = SurveySelectors.useCurrentSurvey();
  const record = DataEntrySelectors.useRecord();
  const isTablet = DeviceInfoSelectors.useIsTablet();
  const isDrawerOpen = DataEntrySelectors.useIsRecordPageSelectorMenuOpen();
  const isLandscape = DeviceInfoSelectors.useOrientationIsLandscape();
  const canEditRecord = DataEntrySelectors.useCanEditRecord();
  const maxSummaryDefs = determineMaxSummaryDefs({
    isDrawerOpen,
    isTablet,
    isLandscape,
  });

  const nodeDefLabel = NodeDefs.getLabelOrName(entityDef, lang);
  const parentEntity = Records.getNodeByUuid(parentEntityUuid!)(record)!;

  const selectedColumns =
    SurveyOptionsSelectors.useEntityListColumns(entityDefUuid);

  const availableNodeDefs = useMemo(
    () =>
      RecordUtils.getApplicableDescendantDefs({
        survey,
        entityDef,
        record,
        parentEntity,
      }),
    [entityDef, parentEntity, record, survey],
  );

  const visibleNodeDefs = useMemo(() => {
    const selectedDefs = selectedColumns
      ? availableNodeDefs.filter((def) => selectedColumns.includes(def.uuid))
      : [];
    if (selectedDefs.length > 0) {
      return selectedDefs;
    }
    if (isLandscape && availableNodeDefs.length <= maxDefaultLandscapeColumns) {
      return availableNodeDefs;
    }
    return RecordUtils.getApplicableSummaryDefs({
      survey,
      entityDef,
      record,
      parentEntity,
      onlyKeys: false,
      maxSummaryDefs,
    });
  }, [
    availableNodeDefs,
    entityDef,
    isLandscape,
    maxSummaryDefs,
    parentEntity,
    record,
    selectedColumns,
    survey,
  ]);

  const horizontalScroll =
    isLandscape || visibleNodeDefs.length > maxSummaryDefs;

  const tableFields: DataVisualizerField[] = useMemo(
    () =>
      visibleNodeDefs.map((summaryDef): DataVisualizerField => ({
        key: NodeDefs.getName(summaryDef),
        header: NodeDefs.getLabelOrName(summaryDef, lang),
        style: { minWidth: horizontalScroll ? 150 : 100 },
        sortable: true,
      })),
    [horizontalScroll, lang, visibleNodeDefs],
  );

  const onNewPress = () => {
    dispatch(DataEntryActions.addNewEntity());
  };

  const onColumnsApply = useCallback(
    (columns: string[] | null) => {
      dispatch(
        SurveyOptionsActions.setEntityListColumns({ entityDefUuid, columns }),
      );
      setColumnsDialogVisible(false);
    },
    [dispatch, entityDefUuid],
  );

  const onRowPress = useCallback(
    ({ uuid }: any) => {
      dispatch(
        DataEntryActions.selectCurrentPageEntity({
          parentEntityUuid,
          entityDefUuid,
          entityUuid: uuid,
        }),
      );
    },
    [dispatch, parentEntityUuid, entityDefUuid],
  );

  const onDeleteSelectedNodeUuids = useCallback(
    async (nodeUuids: any) => {
      if (
        await confirm({
          messageKey: "dataEntry:confirmDeleteSelectedItems.message",
        })
      ) {
        dispatch(DataEntryActions.deleteNodes(nodeUuids));
        return true;
      }
      return false;
    },
    [confirm, dispatch],
  );

  const onSortChange = useCallback((sortNext: SortObject) => {
    setSort(sortNext);
  }, []);

  const entityToRow = useCallback(
    (entity: any) => ({
      key: entity.uuid,
      uuid: entity.uuid,

      ...RecordUtils.getEntitySummaryValuesByNameFormatted({
        survey,
        record,
        entity,
        onlyKeys: false,
        lang,
        summaryDefs: visibleNodeDefs,
        t,
      }),
    }),
    [survey, record, lang, t, visibleNodeDefs],
  );

  const rows = useMemo(() => {
    const entities = Records.getChildren(parentEntity, entityDefUuid)(record);
    const _rows = entities.map(entityToRow);
    if (Objects.isNotEmpty(sort)) {
      ArrayUtils.sortByProps(sort!)(_rows);
    }
    return _rows;
  }, [entityDefUuid, entityToRow, parentEntity, record, sort]);

  const editable = DataEntrySelectors.useRecordNodePointerEditable({
    parentNodeUuid: parentEntityUuid,
    nodeDefUuid: entityDefUuid,
  });

  const canAddOrDelete =
    canEditRecord && editable && !NodeDefs.isEnumerate(entityDef);

  const dataTable = useMemo(
    () => (
      <DataTable
        canDelete={canAddOrDelete}
        fields={tableFields}
        horizontalScroll={horizontalScroll}
        items={rows}
        onDeleteSelectedItemIds={onDeleteSelectedNodeUuids}
        onItemPress={onRowPress}
        onSortChange={onSortChange}
        selectable={canAddOrDelete}
        sort={sort}
      />
    ),
    [
      canAddOrDelete,
      horizontalScroll,
      onDeleteSelectedNodeUuids,
      onRowPress,
      onSortChange,
      rows,
      sort,
      tableFields,
    ],
  );

  // in portrait there is no room for it next to the new button
  const columnsButton = rows.length > 0 && availableNodeDefs.length > 1 && (
    <Button
      compact
      icon="table-column"
      mode="text"
      onPress={() => setColumnsDialogVisible(true)}
      textKey="dataEntry:entityListColumns.button"
    />
  );

  return (
    <VView style={styles.container}>
      {rows.length === 0 && (
        <Text textKey="dataEntry:noEntitiesDefined" variant="titleMedium" />
      )}
      {columnsButton && !isLandscape && (
        <HView fullWidth style={styles.topBar}>
          {columnsButton}
        </HView>
      )}
      {rows.length > 0 && dataTable}
      <HView fullWidth style={styles.bottomBar}>
        {/* side views have the same flex, so the button bar stays centered */}
        {isLandscape && <View style={styles.bottomBarSide} />}
        <HView style={styles.buttonBar}>
          {canAddOrDelete && (
            <NewNodeButton nodeDefLabel={nodeDefLabel} onPress={onNewPress} />
          )}
          <NodeValidationIcon
            nodeDef={entityDef}
            parentNodeUuid={parentEntityUuid}
          />
        </HView>
        {isLandscape && (
          <View style={[styles.bottomBarSide, styles.bottomBarSideRight]}>
            {columnsButton}
          </View>
        )}
      </HView>
      {columnsDialogVisible && (
        <EntityListColumnsDialog
          availableDefs={availableNodeDefs}
          onApply={onColumnsApply}
          onClose={() => setColumnsDialogVisible(false)}
          onReset={() => onColumnsApply(null)}
          visibleDefs={visibleNodeDefs}
        />
      )}
    </VView>
  );
};
