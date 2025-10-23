// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";
import { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";

import { NodeDefs, Records } from "@openforis/arena-core";

import { DataTable, HView, ScrollView, Text, VView } from "components";
import { useTranslation } from "localization";
import { RecordNodes } from "model/utils/RecordNodes";
import {
  DataEntryActions,
  DataEntrySelectors,
  DeviceInfoSelectors,
  SurveySelectors,
  useConfirm,
} from "state";

import { NewNodeButton } from "../NewNodeButton";
import { NodeValidationIcon } from "../NodeValidationIcon";

import styles from "./styles";

const determineMaxSummaryDefs = ({
  isDrawerOpen,
  isTablet,
  isLandscape
}: any) => {
  const result = isTablet && !isDrawerOpen ? 5 : 3;
  return isLandscape ? result + 2 : result;
};

export const NodeMultipleEntityListComponent = (props: any) => {
  const { entityDef, parentEntityUuid } = props;

  const dispatch = useDispatch();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const confirm = useConfirm();
  const { t } = useTranslation();

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

  const tableFields = useMemo(
    () =>
      visibleNodeDefs.map((summaryDef) => ({
        key: NodeDefs.getName(summaryDef),
        header: NodeDefs.getLabelOrName(summaryDef, lang),
        style: { minWidth: isLandscape ? 150 : 100 },
      })),
    [isLandscape, lang, visibleNodeDefs]
  );

  const onNewPress = () => {
    // @ts-expect-error TS(2345): Argument of type '(dispatch: any) => Promise<void>... Remove this comment to see the full error message
    dispatch(DataEntryActions.addNewEntity());
  };

  const onRowPress = useCallback(
    ({
      uuid
    }: any) => {
      dispatch(
        // @ts-expect-error TS(2345): Argument of type '(dispatch: any, getState: any) =... Remove this comment to see the full error message
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
        // @ts-expect-error TS(2345): Argument of type '(dispatch: any, getState: any) =... Remove this comment to see the full error message
        dispatch(DataEntryActions.deleteNodes(nodeUuids));
      }
    },
    [confirm, dispatch]
  );

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
      })
    }),
    [survey, record, lang, t, visibleNodeDefs]
  );

  const rows = useMemo(() => {
    // @ts-expect-error TS(2345): Argument of type 'Node | undefined' is not assigna... Remove this comment to see the full error message
    const entities = Records.getChildren(parentEntity, entityDefUuid)(record);
    return entities.map(entityToRow);
  }, [entityDefUuid, entityToRow, parentEntity, record]);

  const canAddNew = canEditRecord && !NodeDefs.isEnumerate(entityDef);

  const dataTable = useMemo(
    () => (
      <DataTable
        fields={tableFields}
        items={rows}
        onItemPress={onRowPress}
        onDeleteSelectedItemIds={onDeleteSelectedNodeUuids}
        selectable={canEditRecord}
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
          // @ts-expect-error TS(2322): Type '{ children: Element; horizontal: true; persi... Remove this comment to see the full error message
          <ScrollView horizontal persistentScrollbar>
            {dataTable}
          </ScrollView>
        ) : (
          dataTable
        ))}
      <HView fullWidth style={styles.buttonBar}>
        {canAddNew && (
          // @ts-expect-error TS(2786): 'NewNodeButton' cannot be used as a JSX component.
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

NodeMultipleEntityListComponent.propTypes = {
  entityDef: PropTypes.object.isRequired,
  parentEntityUuid: PropTypes.string,
};
