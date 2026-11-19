import {
  ArenaRecordNode,
  ArenaNodeDefCode,
  ArenaNodeDefEntity,
  NodeDefs,
  RecordNodes,
  RecordNodeValues,
  Objects,
  Records,
  RecordValidations,
  ArenaSurvey,
  Surveys,
  ArenaValidation,
  ArenaAnyNodeDef,
} from "@openforis/arena-core";

import { SurveyDefs } from "model";

import { SurveySelectors } from "../survey/selectors";
import type { RootState } from "../store";
import { useAppSelector } from "../storeHooks";
import {
  extractAttributeValue,
  NodePointerParams,
  ParentNodeUuidNodeDefParams,
  selectRecordCycle,
  selectRecordUnsafe,
} from "./selectorsRecord";

const selectRecordSingleNodeUuid =
  ({ parentNodeUuid, nodeDefUuid }: NodePointerParams) =>
  (state: RootState): string | undefined => {
    const record = selectRecordUnsafe(state);
    if (!parentNodeUuid || !record) {
      return undefined;
    }
    const parentNode = Records.getNodeByUuid(parentNodeUuid)(record)!;
    const node = Records.getChild(parentNode, nodeDefUuid)(record);
    return node?.uuid;
  };

const selectRecordEntitiesUuidsAndKeyValues =
  ({ parentNodeUuid, nodeDefUuid }: NodePointerParams) =>
  (state: RootState): { uuid: string; keyValues: unknown[] }[] => {
    if (!parentNodeUuid) {
      return [];
    }
    const record = selectRecordUnsafe(state);
    if (!record) {
      return [];
    }
    const survey = SurveySelectors.selectCurrentSurvey(state)!;
    const parentNode = Records.getNodeByUuid(parentNodeUuid)(record)!;
    const entities = Records.getChildren(parentNode, nodeDefUuid)(record);
    return entities.map((entity) => ({
      uuid: entity.uuid,
      keyValues: Records.getEntityKeyValues(survey, entity)(record),
    }));
  };

const selectRecordNodePointerEditable =
  ({ parentNodeUuid, nodeDefUuid }: NodePointerParams) =>
  (state: RootState): boolean => {
    if (!parentNodeUuid) {
      return true;
    }
    const record = selectRecordUnsafe(state);
    if (!record) {
      return true;
    }

    const parentNode = Records.getNodeByUuid(parentNodeUuid)(record);
    if (!parentNode) {
      return true;
    }
    return (
      Records.isNodeEditable(parentNode)(record) &&
      RecordNodes.isChildEditable(parentNode, nodeDefUuid)
    );
  };

const selectRecordNodePointerVisibility =
  ({ parentNodeUuid, nodeDefUuid }: NodePointerParams) =>
  (state: RootState): boolean => {
    if (!parentNodeUuid) {
      return false;
    }
    const survey = SurveySelectors.selectCurrentSurvey(state)!;
    const record = selectRecordUnsafe(state);
    if (!record) {
      return false;
    }

    const parentNode = Records.getNodeByUuid(parentNodeUuid)(record)!;
    const applicable = RecordNodes.isChildApplicable(parentNode, nodeDefUuid);
    const visible = RecordNodes.isChildVisible(parentNode, nodeDefUuid);
    const nodeDefChild = Surveys.getNodeDefByUuid({
      survey,
      uuid: nodeDefUuid,
    });
    const cycle = record.cycle;
    const hiddenWhenNotRelevant =
      NodeDefs.isHiddenWhenNotRelevant(cycle)(nodeDefChild);
    return visible && (applicable || !hiddenWhenNotRelevant);
  };

const selectRecordAttributeInfo =
  ({ nodeUuid }: { nodeUuid: string }) =>
  (
    state: RootState,
  ): {
    applicable: boolean;
    value: any;
    validation: ArenaValidation | null;
  } => {
    const record = selectRecordUnsafe(state);
    const defaultAttributeState = {
      applicable: false,
      value: null,
      validation: null,
    };
    if (!record) {
      return defaultAttributeState;
    }
    const attribute = Records.getNodeByUuid(nodeUuid)(record);
    if (!attribute) {
      return defaultAttributeState;
    }
    const value = extractAttributeValue({ state, attribute });
    const validation = RecordValidations.getValidationNode({ nodeUuid })(
      record.validation!,
    );
    const applicable = Records.isNodeApplicable(attribute)(record);
    return { applicable, value, validation };
  };

const selectRecordChildNodes =
  ({ parentNodeUuid, nodeDef }: ParentNodeUuidNodeDefParams) =>
  (state: RootState): { nodes: ArenaRecordNode[] } => {
    const record = selectRecordUnsafe(state);
    if (!parentNodeUuid || !record) {
      return { nodes: [] };
    }
    const parentEntity = Records.getNodeByUuid(parentNodeUuid)(record)!;
    const nodes = Records.getChildren(parentEntity, nodeDef.uuid)(record);
    return { nodes };
  };

const selectIsRecordAttributeFilled =
  ({ parentNodeUuid, nodeDef }: ParentNodeUuidNodeDefParams) =>
  (state: RootState): boolean => {
    const { nodes } = selectRecordChildNodes({ parentNodeUuid, nodeDef })(
      state,
    );
    return (
      nodes.length > 0 &&
      nodes.every((node) => RecordNodes.isValueNotBlank(node))
    );
  };

// child defs depend only on survey, cycle and entity def: cached per survey (selected by every form field)
const childDefsCacheBySurvey = new WeakMap<
  object,
  Map<string, ArenaAnyNodeDef[]>
>();

export const getChildDefs = ({
  survey,
  cycle,
  nodeDef,
}: {
  survey: ArenaSurvey;
  cycle: string;
  nodeDef: ArenaNodeDefEntity;
}): ArenaAnyNodeDef[] => {
  let cache = childDefsCacheBySurvey.get(survey);
  if (!cache) {
    cache = new Map();
    childDefsCacheBySurvey.set(survey, cache);
  }
  const cacheKey = `${cycle}_${nodeDef.uuid}`;
  let childDefs = cache.get(cacheKey);
  if (!childDefs) {
    childDefs = SurveyDefs.getChildrenDefs({ survey, nodeDef, cycle }).filter(
      (childDef) => {
        // only child defs not hidden in mobile and in same page
        const layoutProps = NodeDefs.getLayoutProps(cycle)(childDef);
        return !layoutProps.pageUuid;
      },
    );
    cache.set(cacheKey, childDefs);
  }
  return childDefs;
};

const selectChildDefs =
  ({ nodeDef }: { nodeDef: ArenaNodeDefEntity }) =>
  (state: RootState): ArenaAnyNodeDef[] =>
    getChildDefs({
      survey: SurveySelectors.selectCurrentSurvey(state)!,
      cycle: selectRecordCycle(state),
      nodeDef,
    });

const selectRecordCodeParentItemUuid =
  ({
    nodeDef,
    parentNodeUuid,
  }: {
    nodeDef: ArenaNodeDefCode;
    parentNodeUuid: string | undefined;
  }) =>
  (state: RootState): string | undefined => {
    const parentCodeDefUuid = NodeDefs.getParentCodeDefUuid(nodeDef);
    if (!parentNodeUuid || !parentCodeDefUuid) {
      return undefined;
    }
    const record = selectRecordUnsafe(state);
    if (!record) {
      return undefined;
    }
    const parentNode = Records.getNodeByUuid(parentNodeUuid)(record)!;
    const parentCodeAttribute = Records.getParentCodeAttribute(
      parentNode,
      nodeDef,
    )(record);
    return parentCodeAttribute
      ? RecordNodeValues.getItemUuid(parentCodeAttribute)
      : undefined;
  };

const selectIsMaxCountReached =
  ({ parentNodeUuid, nodeDef }: ParentNodeUuidNodeDefParams) =>
  (state: RootState): boolean => {
    const record = selectRecordUnsafe(state);
    if (!record) {
      return false;
    }
    const parentNode = parentNodeUuid
      ? Records.getNodeByUuid(parentNodeUuid)(record)
      : null;
    if (!parentNode) return false;

    const maxCount = RecordNodes.getChildrenMaxCount({
      parentNode,
      nodeDef,
    });
    if (Objects.isEmpty(maxCount)) return false;

    const siblings = Records.getChildren(parentNode, nodeDef.uuid)(record);
    return siblings.length >= maxCount;
  };

const useIsNodeMaxCountReached = ({
  parentNodeUuid,
  nodeDef,
}: ParentNodeUuidNodeDefParams): boolean =>
  useAppSelector(selectIsMaxCountReached({ parentNodeUuid, nodeDef }));

export const RecordNodesSelectors = {
  selectRecordNodePointerEditable,

  useRecordSingleNodeUuid: ({
    parentNodeUuid,
    nodeDefUuid,
  }: NodePointerParams) =>
    useAppSelector(selectRecordSingleNodeUuid({ parentNodeUuid, nodeDefUuid })),

  useRecordEntityChildDefs: ({ nodeDef }: { nodeDef: ArenaNodeDefEntity }) =>
    useAppSelector(selectChildDefs({ nodeDef }), Objects.isEqual),

  useRecordNodePointerVisibility: ({
    parentNodeUuid,
    nodeDefUuid,
  }: NodePointerParams) =>
    useAppSelector(
      selectRecordNodePointerVisibility({ parentNodeUuid, nodeDefUuid }),
    ),

  useRecordNodePointerEditable: ({
    parentNodeUuid,
    nodeDefUuid,
  }: NodePointerParams) =>
    useAppSelector(
      selectRecordNodePointerEditable({ parentNodeUuid, nodeDefUuid }),
    ),

  useRecordAttributeInfo: ({ nodeUuid }: { nodeUuid: string }) =>
    useAppSelector(selectRecordAttributeInfo({ nodeUuid }), Objects.isEqual),

  useRecordChildNodes: ({
    parentEntityUuid,
    nodeDef,
  }: {
    parentEntityUuid: string | undefined;
    nodeDef: ArenaAnyNodeDef;
  }) =>
    useAppSelector(
      selectRecordChildNodes({ parentNodeUuid: parentEntityUuid, nodeDef }),
      Objects.isEqual,
    ),

  useIsRecordAttributeFilled: ({
    parentNodeUuid,
    nodeDef,
  }: ParentNodeUuidNodeDefParams) =>
    useAppSelector(selectIsRecordAttributeFilled({ parentNodeUuid, nodeDef })),

  useRecordEntitiesUuidsAndKeyValues: ({
    parentNodeUuid,
    nodeDefUuid,
  }: NodePointerParams) =>
    useAppSelector(
      selectRecordEntitiesUuidsAndKeyValues({ parentNodeUuid, nodeDefUuid }),
      Objects.isEqual,
    ),

  useRecordCodeParentItemUuid: ({
    parentNodeUuid,
    nodeDef,
  }: {
    parentNodeUuid: string | undefined;
    nodeDef: ArenaNodeDefCode;
  }) =>
    useAppSelector(selectRecordCodeParentItemUuid({ parentNodeUuid, nodeDef })),

  selectIsMaxCountReached,
  useIsNodeMaxCountReached,
};
