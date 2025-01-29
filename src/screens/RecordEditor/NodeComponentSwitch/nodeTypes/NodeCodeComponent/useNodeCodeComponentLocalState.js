import { useCallback, useMemo, useState } from "react";
import { useDispatch } from "react-redux";

import {
  CategoryItems,
  NodeDefs,
  NodeValues,
  Surveys,
} from "@openforis/arena-core";

import { SurveyService } from "service/surveyService";

import { DataEntryActions, DataEntrySelectors, SurveySelectors } from "state";
import { useItemsFilter } from "../useItemsFilter";

export const useNodeCodeComponentLocalState = ({ parentNodeUuid, nodeDef }) => {
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

  const items = useItemsFilter({
    nodeDef,
    parentNodeUuid,
    items: _items,
  });

  const selectedItems = useMemo(
    () =>
      nodes.reduce((acc, node) => {
        const item = Surveys.getCategoryItemByUuid({
          survey,
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
    (item) => {
      if (!item) return "";

      return NodeDefs.isCodeShown(cycle)(nodeDef)
        ? CategoryItems.getLabelWithCode(item, lang)
        : CategoryItems.getLabel(item, lang, true);
    },
    [cycle, lang, nodeDef]
  );

  const onItemAdd = useCallback(
    (itemUuid) => {
      const value = NodeValues.newCodeValue({ itemUuid });
      if (NodeDefs.isSingle(nodeDef)) {
        const node = nodes[0];
        dispatch(
          DataEntryActions.updateAttribute({
            uuid: node.uuid,
            value,
          })
        );
      } else {
        dispatch(
          DataEntryActions.addNewAttribute({
            nodeDef,
            parentNodeUuid,
            value,
          })
        );
      }
    },
    [dispatch, nodeDef, nodes, parentNodeUuid]
  );

  const onItemRemove = useCallback(
    (itemUuid) => {
      if (NodeDefs.isSingle(nodeDef)) {
        const node = nodes[0];
        dispatch(
          DataEntryActions.updateAttribute({
            uuid: node.uuid,
            value: null,
          })
        );
      } else {
        const nodeToRemove = nodes.find(
          (node) => NodeValues.getItemUuid(node) === itemUuid
        );
        dispatch(DataEntryActions.deleteNodes([nodeToRemove.uuid]));
      }
    },
    [dispatch, nodeDef, nodes]
  );

  const onSingleValueChange = useCallback(
    (itemUuid) => {
      const node = nodes[0];
      const value = NodeValues.newCodeValue({ itemUuid });
      dispatch(
        DataEntryActions.updateAttribute({
          uuid: node.uuid,
          value,
        })
      );
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
