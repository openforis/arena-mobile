import { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";

import { NodeDefs, Records } from "@openforis/arena-core";

import { DataTable, Text, VView } from "components";
import { RecordNodes } from "model/utils/RecordNodes";
import {
  DataEntryActions,
  DataEntrySelectors,
  DeviceInfoSelectors,
  SurveySelectors,
  useConfirm,
} from "state";

import { NewNodeButton } from "../NewNodeButton";

import styles from "./styles";

const determineMaxSummaryDefs = ({ isDrawerOpen, isTablet, isLandscape }) => {
  const result = isTablet && !isDrawerOpen ? 5 : 3;
  return isLandscape ? result + 2 : result;
};

export const NodeMultipleEntityListComponent = (props) => {
  const { entityDef, parentEntityUuid } = props;

  const dispatch = useDispatch();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const confirm = useConfirm();

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
  const parentEntity = Records.getNodeByUuid(parentEntityUuid)(record);

  const visibleSummaryDefs = useMemo(
    () =>
      RecordNodes.getApplicableSummaryDefs({
        survey,
        entityDef,
        record,
        parentEntity,
        onlyKeys: false,
        maxSummaryDefs,
      }),
    [entityDef, maxSummaryDefs, parentEntity, record, survey]
  );

  const entities = Records.getChildren(parentEntity, entityDefUuid)(record);

  const onNewPress = () => {
    dispatch(DataEntryActions.addNewEntity);
  };

  const onRowPress = useCallback(
    ({ uuid }) => {
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
    async (nodeUuids) => {
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

  const entityToRow = useCallback(
    (entity) => ({
      key: entity.uuid,
      uuid: entity.uuid,
      ...RecordNodes.getEntitySummaryValuesByNameFormatted({
        survey,
        record,
        entity,
        onlyKeys: false,
        lang,
        summaryDefs: visibleSummaryDefs,
      }),
    }),
    [survey, record, lang, visibleSummaryDefs]
  );

  const rows = entities.map(entityToRow);

  const canAddNew = canEditRecord && !NodeDefs.isEnumerate(entityDef);

  return (
    <VView style={styles.container}>
      {rows.length === 0 && (
        <Text textKey="dataEntry:noEntitiesDefined" variant="titleMedium" />
      )}
      {rows.length > 0 && (
        <DataTable
          fields={visibleSummaryDefs.map((summaryDef) => ({
            key: NodeDefs.getName(summaryDef),
            header: NodeDefs.getLabelOrName(summaryDef, lang),
          }))}
          items={rows}
          onItemPress={onRowPress}
          onDeleteSelectedItemIds={onDeleteSelectedNodeUuids}
          selectable={canEditRecord}
        />
      )}
      {canAddNew && (
        <NewNodeButton nodeDefLabel={nodeDefLabel} onPress={onNewPress} />
      )}
    </VView>
  );
};

NodeMultipleEntityListComponent.propTypes = {
  entityDef: PropTypes.object.isRequired,
  parentEntityUuid: PropTypes.string,
};
