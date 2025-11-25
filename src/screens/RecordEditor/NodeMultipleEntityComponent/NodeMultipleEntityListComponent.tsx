import { useCallback, useMemo, useState } from "react";

import { NodeDefs, Objects, Records } from "@openforis/arena-core";

import { DataTable, HView, ScrollView, Text, VView } from "components";
import { useTranslation } from "localization";
import { RecordNodes } from "model/utils/RecordNodes";
import {
  DataEntryActions,
  DataEntrySelectors,
  DeviceInfoSelectors,
  SurveySelectors,
  useAppDispatch,
  useConfirm,
} from "state";

import { NewNodeButton } from "../NewNodeButton";
import { NodeValidationIcon } from "../NodeValidationIcon";

import styles from "./styles";
import { DataTableField } from "components/DataTable/DataTable";
import { ArrayUtils } from "utils/ArrayUtils";

const determineMaxSummaryDefs = ({
  isDrawerOpen,
  isTablet,
  isLandscape,
}: any) => {
  const result = isTablet && !isDrawerOpen ? 5 : 3;
  return isLandscape ? result + 2 : result;
};

type NodeMultipleEntityListComponentProps = {
  entityDef: any;
  parentEntityUuid?: string;
};

export const NodeMultipleEntityListComponent = (
  props: NodeMultipleEntityListComponentProps
) => {
  const { entityDef, parentEntityUuid } = props;

  const dispatch = useAppDispatch();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const confirm = useConfirm();
  const { t } = useTranslation();
  const [sort, setSort] = useState(null);

  if (__DEV__) {
    console.log(
      "Rendering NodeMultipleEntityListComponent for " +
        NodeDefs.getName(entityDef)
    );
  }

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

  const visibleNodeDefs = useMemo(
    () =>
      isLandscape
        ? RecordNodes.getApplicableDescendantDefs({
            survey,
            entityDef,
            record,
            parentEntity,
          })
        : RecordNodes.getApplicableSummaryDefs({
            survey,
            entityDef,
            record,
            parentEntity,
            onlyKeys: false,
            maxSummaryDefs,
          }),
    [entityDef, isLandscape, maxSummaryDefs, parentEntity, record, survey]
  );

  const tableFields: DataTableField[] = useMemo(
    () =>
      visibleNodeDefs.map(
        (summaryDef): DataTableField => ({
          key: NodeDefs.getName(summaryDef),
          header: NodeDefs.getLabelOrName(summaryDef, lang),
          style: { minWidth: isLandscape ? 150 : 100 },
          sortable: true,
        })
      ),
    [isLandscape, lang, visibleNodeDefs]
  );

  const onNewPress = () => {
    dispatch(DataEntryActions.addNewEntity());
  };

  const onRowPress = useCallback(
    ({ uuid }: any) => {
      dispatch(
        DataEntryActions.selectCurrentPageEntity({
          parentEntityUuid,
          entityDefUuid,
          entityUuid: uuid,
        })
      );
    },
    [dispatch, parentEntityUuid, entityDefUuid]
  );

  const onDeleteSelectedNodeUuids = useCallback(
    async (nodeUuids: any) => {
      if (
        await confirm({
          messageKey: "dataEntry:confirmDeleteSelectedItems.message",
        })
      ) {
        dispatch(DataEntryActions.deleteNodes(nodeUuids));
      }
    },
    [confirm, dispatch]
  );

  const onSortChange = useCallback((sortNext: any) => {
    setSort(sortNext);
  }, []);

  const entityToRow = useCallback(
    (entity: any) => ({
      key: entity.uuid,
      uuid: entity.uuid,

      ...RecordNodes.getEntitySummaryValuesByNameFormatted({
        survey,
        record,
        entity,
        onlyKeys: false,
        lang,
        summaryDefs: visibleNodeDefs,
        t,
      }),
    }),
    [survey, record, lang, t, visibleNodeDefs]
  );

  const rows = useMemo(() => {
    const entities = Records.getChildren(parentEntity, entityDefUuid)(record);
    const _rows = entities.map(entityToRow);
    if (Objects.isNotEmpty(sort)) {
      ArrayUtils.sortByProps(sort!)(_rows);
    }
    return _rows;
  }, [entityDefUuid, entityToRow, parentEntity, record]);

  const canAddNew = canEditRecord && !NodeDefs.isEnumerate(entityDef);

  const dataTable = useMemo(
    () => (
      <DataTable
        fields={tableFields}
        items={rows}
        onDeleteSelectedItemIds={onDeleteSelectedNodeUuids}
        onItemPress={onRowPress}
        onSortChange={onSortChange}
        selectable={canEditRecord}
        sort={sort}
      />
    ),
    [canEditRecord, onDeleteSelectedNodeUuids, onRowPress, rows, tableFields]
  );

  return (
    <VView style={styles.container}>
      {rows.length === 0 && (
        <Text textKey="dataEntry:noEntitiesDefined" variant="titleMedium" />
      )}
      {rows.length > 0 &&
        (isLandscape ? (
          <ScrollView horizontal persistentScrollbar>
            {dataTable}
          </ScrollView>
        ) : (
          dataTable
        ))}
      <HView fullWidth style={styles.buttonBar}>
        {canAddNew && (
          <NewNodeButton nodeDefLabel={nodeDefLabel} onPress={onNewPress} />
        )}
        <NodeValidationIcon
          nodeDef={entityDef}
          parentNodeUuid={parentEntityUuid}
        />
      </HView>
    </VView>
  );
};
