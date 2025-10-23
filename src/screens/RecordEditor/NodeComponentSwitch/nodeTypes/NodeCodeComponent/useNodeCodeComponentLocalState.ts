import { useCallback, useMemo, useState } from "react";
import { useDispatch } from "react-redux";

import {
  CategoryItems,
  NodeDefs,
  NodeValues,
  Surveys,
} from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'service/surveyService' or its ... Remove this comment to see the full error message
import { SurveyService } from "service/surveyService";

import {
  DataEntryActions,
  DataEntrySelectors,
  MessageActions,
  SurveySelectors,
// @ts-expect-error TS(2307): Cannot find module 'state' or its corresponding ty... Remove this comment to see the full error message
} from "state";
import { useItemsFilter } from "../useItemsFilter";

export const useNodeCodeComponentLocalState = ({
  parentNodeUuid,
  nodeDef
}: any) => {
  const dispatch = useDispatch();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [
    findClosestSamplingPointDialogOpen,
    setFindClosestSamplingPointDialogOpen,
  ] = useState(false);

  const { nodes } = DataEntrySelectors.useRecordChildNodes({
    parentEntityUuid: parentNodeUuid,
    nodeDef,
  });

  const survey = SurveySelectors.useCurrentSurvey();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const cycle = DataEntrySelectors.useRecordCycle();
  const parentItemUuid = DataEntrySelectors.useRecordCodeParentItemUuid({
    nodeDef,
    parentNodeUuid,
  });
  const maxCountReached = DataEntrySelectors.useIsNodeMaxCountReached({
    parentNodeUuid,
    nodeDef,
  });

  const _items = useMemo(() => {
    const levelIndex = Surveys.getNodeDefCategoryLevelIndex({
      survey,
      nodeDef,
    });
    const categoryUuid = NodeDefs.getCategoryUuid(nodeDef);
    return levelIndex > 0 && !parentItemUuid
      ? []
      : SurveyService.fetchCategoryItems({
          survey,
          categoryUuid,
          parentItemUuid,
        });
  }, [survey, nodeDef, parentItemUuid]);

  const items = useItemsFilter({ nodeDef, parentNodeUuid, items: _items });

  const selectedItems = useMemo(
    () =>
      nodes.reduce((acc: any, node: any) => {
        const item = Surveys.getCategoryItemByUuid({
          survey,
          // @ts-expect-error TS(2322): Type 'string | undefined' is not assignable to typ... Remove this comment to see the full error message
          itemUuid: NodeValues.getItemUuid(node),
        });
        if (item) acc.push(item);
        return acc;
      }, []),
    [survey, nodes]
  );

  const selectedItemUuid =
    selectedItems.length === 1 ? selectedItems[0].uuid : null;

  const itemLabelFunction = useCallback(
    (item: any) => {
      if (!item) return "";

      return NodeDefs.isCodeShown(cycle)(nodeDef)
        ? CategoryItems.getLabelWithCode(item, lang)
        : CategoryItems.getLabel(item, lang, true);
    },
    [cycle, lang, nodeDef]
  );

  const onItemAdd = useCallback(
    (itemUuid: any) => {
      const value = NodeValues.newCodeValue({ itemUuid });
      if (NodeDefs.isSingle(nodeDef)) {
        const node = nodes[0];
        dispatch(DataEntryActions.updateAttribute({ uuid: node.uuid, value }));
      } else if (maxCountReached) {
        dispatch(
          MessageActions.setInfo(
            "dataEntry:node.cannotAddMoreItems.maxCountReached"
          )
        );
      } else {
        dispatch(
          DataEntryActions.addNewAttribute({ nodeDef, parentNodeUuid, value })
        );
      }
    },
    [dispatch, maxCountReached, nodeDef, nodes, parentNodeUuid]
  );

  const onItemRemove = useCallback(
    (itemUuid: any) => {
      if (NodeDefs.isSingle(nodeDef)) {
        const node = nodes[0];
        dispatch(
          DataEntryActions.updateAttribute({ uuid: node.uuid, value: null })
        );
      } else {
        const nodeToRemove = nodes.find(
          (node: any) => NodeValues.getItemUuid(node) === itemUuid
        );
        dispatch(DataEntryActions.deleteNodes([nodeToRemove.uuid]));
      }
    },
    [dispatch, nodeDef, nodes]
  );

  const onSingleValueChange = useCallback(
    (itemUuid: any) => {
      const node = nodes[0];
      const wasSelected = NodeValues.getItemUuid(node) === itemUuid;
      const value = wasSelected ? null : NodeValues.newCodeValue({ itemUuid });
      dispatch(DataEntryActions.updateAttribute({ uuid: node.uuid, value }));
    },
    [dispatch, nodes]
  );

  const openEditDialog = useCallback(() => setEditDialogOpen(true), []);
  const closeEditDialog = useCallback(() => setEditDialogOpen(false), []);

  const openFindClosestSamplingPointDialog = useCallback(
    () => setFindClosestSamplingPointDialogOpen(true),
    []
  );
  const closeFindClosestSamplingPointDialog = useCallback(
    () => setFindClosestSamplingPointDialogOpen(false),
    []
  );

  return {
    closeEditDialog,
    closeFindClosestSamplingPointDialog,
    editDialogOpen,
    findClosestSamplingPointDialogOpen,
    items,
    itemLabelFunction,
    onItemAdd,
    onItemRemove,
    onSingleValueChange,
    openEditDialog,
    openFindClosestSamplingPointDialog,
    selectedItems,
    selectedItemUuid,
  };
};
