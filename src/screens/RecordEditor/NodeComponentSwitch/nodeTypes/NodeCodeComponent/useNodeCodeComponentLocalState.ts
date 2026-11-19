import { useCallback, useMemo, useState } from "react";

import {
  ArenaCategoryItem,
  CategoryItems,
  ArenaNodeDefCode,
  NodeDefs,
  RecordNodeValues,
  Surveys,
} from "@openforis/arena-core";

import { SurveyService } from "service/surveyService";

import {
  DataEntryActions,
  DataEntrySelectors,
  MessageActions,
  SurveySelectors,
  useAppDispatch,
} from "state";
import { useItemsFilter } from "../useItemsFilter";

export const useNodeCodeComponentLocalState = ({
  parentNodeUuid,
  nodeDef,
}: {
  parentNodeUuid?: string;
  nodeDef: ArenaNodeDefCode;
}) => {
  const dispatch = useAppDispatch();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [
    findClosestSamplingPointDialogOpen,
    setFindClosestSamplingPointDialogOpen,
  ] = useState(false);

  const { nodes } = DataEntrySelectors.useRecordChildNodes({
    parentEntityUuid: parentNodeUuid,
    nodeDef,
  });

  const survey = SurveySelectors.useCurrentSurvey()!;
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
      nodes.reduce((acc, node) => {
        const itemUuid = RecordNodeValues.getItemUuid(node)!;
        const item = Surveys.getCategoryItemByUuid({ survey, itemUuid });
        if (item) acc.push(item);
        return acc;
      }, [] as ArenaCategoryItem[]),
    [survey, nodes],
  );

  const selectedItemUuid =
    selectedItems.length === 1 ? selectedItems[0]?.uuid : null;

  const itemLabelFunction = useCallback(
    (item: ArenaCategoryItem | null | undefined) => {
      if (!item) return "";

      return NodeDefs.isCodeShown(cycle)(nodeDef)
        ? CategoryItems.getLabelWithCode(item, lang)
        : CategoryItems.getLabel(item, lang, true);
    },
    [cycle, lang, nodeDef],
  );

  const onItemAdd = useCallback(
    (itemUuid: string) => {
      const value = RecordNodeValues.newCodeValue({ itemUuid });
      if (NodeDefs.isSingle(nodeDef)) {
        const node = nodes[0];
        if (node) {
          dispatch(
            DataEntryActions.updateAttribute({ uuid: node.uuid, value }),
          );
        } else {
          dispatch(
            MessageActions.setWarning(
              "dataEntry:node.cannotUpdateSingleAttributeValue.noNodeFound",
            ),
          );
        }
      } else if (maxCountReached) {
        dispatch(
          MessageActions.setInfo(
            "dataEntry:node.cannotAddMoreItems.maxCountReached",
          ),
        );
      } else {
        dispatch(
          DataEntryActions.addNewAttribute({ nodeDef, parentNodeUuid, value }),
        );
      }
    },
    [dispatch, maxCountReached, nodeDef, nodes, parentNodeUuid],
  );

  const onItemRemove = useCallback(
    (itemUuid: string) => {
      if (NodeDefs.isSingle(nodeDef)) {
        const node = nodes[0];
        if (node) {
          dispatch(
            DataEntryActions.updateAttribute({
              uuid: node.uuid,
              value: null,
            }),
          );
        } else {
          dispatch(
            MessageActions.setWarning(
              "dataEntry:node.cannotUpdateSingleAttributeValue.noNodeFound",
            ),
          );
        }
      } else {
        const nodeToRemove = nodes.find(
          (node) => RecordNodeValues.getItemUuid(node) === itemUuid,
        );
        if (nodeToRemove) {
          dispatch(DataEntryActions.deleteNodes([nodeToRemove.uuid]));
        } else {
          dispatch(
            MessageActions.setWarning(
              "dataEntry:node.cannotDeleteNode.noNodeFound",
            ),
          );
        }
      }
    },
    [dispatch, nodeDef, nodes],
  );

  const onSingleValueChange = useCallback(
    (itemUuid: string | null | undefined) => {
      const node = nodes[0]!;
      const wasSelected = RecordNodeValues.getItemUuid(node) === itemUuid;
      const value =
        !itemUuid || wasSelected
          ? null
          : RecordNodeValues.newCodeValue({ itemUuid });
      dispatch(DataEntryActions.updateAttribute({ uuid: node.uuid, value }));
    },
    [dispatch, nodes],
  );

  const openEditDialog = useCallback(() => setEditDialogOpen(true), []);
  const closeEditDialog = useCallback(() => setEditDialogOpen(false), []);

  const openFindClosestSamplingPointDialog = useCallback(
    () => setFindClosestSamplingPointDialogOpen(true),
    [],
  );
  const closeFindClosestSamplingPointDialog = useCallback(
    () => setFindClosestSamplingPointDialogOpen(false),
    [],
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
