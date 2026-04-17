import { useSelector } from "react-redux";

import {
  ArenaRecord,
  ArenaRecordNode,
  NodeDef,
  NodeDefCode,
  NodeDefEntity,
  NodeDefs,
  Nodes,
  NodeValues,
  Objects,
  Records,
  RecordValidations,
  Surveys,
  Users,
  Validation,
  Validations,
} from "@openforis/arena-core";

import { RecordCurrentPageEntity, RecordNodes, SurveyDefs } from "model";

import { SurveySelectors } from "../survey/selectors";
import { RemoteConnectionSelectors } from "../remoteConnection/selectors";
import { DataEntryState, PreviousCycleRecordPageEntityPointer } from "./types";

type ParentNodeUuidNodeDefParams = {
  parentNodeUuid: string | undefined;
  nodeDef: NodeDef<any>;
};

const getDataEntryState = (state: any): DataEntryState => state.dataEntry;

const selectRecordUnsafe = (state: any): ArenaRecord | undefined =>
  getDataEntryState(state).record;

const selectRecord = (state: any): ArenaRecord => selectRecordUnsafe(state)!;

const selectIsEditingRecord = (state: any): boolean =>
  !!selectRecordUnsafe(state);

const selectRecordEditLocked = (state: any): boolean =>
  !!getDataEntryState(state).recordEditLocked;

const selectIsRecordInDefaultCycle = (state: any): boolean => {
  const survey = SurveySelectors.selectCurrentSurvey(state);
  const defaultCycle = survey ? Surveys.getDefaultCycleKey(survey) : null;
  const record = selectRecordUnsafe(state);
  return String(defaultCycle) === String(record?.cycle);
};

const selectRecordEditLockAvailable = (state: any) =>
  !!getDataEntryState(state).recordEditLockAvailable &&
  selectIsEditingRecord(state) &&
  selectIsRecordInDefaultCycle(state);

const selectCanEditRecord = (state: any) => {
  const editLocked = selectRecordEditLocked(state);
  const recordInDefaultCycle = selectIsRecordInDefaultCycle(state);
  return !editLocked && recordInDefaultCycle;
};

const selectRecordRootNodeUuid = (state: any): string | undefined => {
  const record = selectRecordUnsafe(state);
  return record && Records.getRoot(record)?.uuid;
};

const selectRecordCycle = (state: any): string | undefined => {
  const record = selectRecordUnsafe(state);
  return record?.cycle;
};

const selectRecordSingleNodeUuid =
  ({
    parentNodeUuid,
    nodeDefUuid,
  }: {
    parentNodeUuid: string | undefined;
    nodeDefUuid: string;
  }) =>
  (state: any): string | null => {
    const record = selectRecordUnsafe(state);
    if (!parentNodeUuid || !record) {
      return null;
    }
    const parentNode = Records.getNodeByUuid(parentNodeUuid)(record)!;
    const node = Records.getChild(parentNode, nodeDefUuid)(record);
    return node?.uuid;
  };

const selectRecordEntitiesUuidsAndKeyValues =
  ({
    parentNodeUuid,
    nodeDefUuid,
  }: {
    parentNodeUuid: string | undefined;
    nodeDefUuid: string;
  }) =>
  (state: any): { uuid: string; keyValues: any }[] => {
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
      keyValues: Records.getEntityKeyValues({ survey, record, entity }),
    }));
  };

const selectRecordNodePointerValidation =
  (state: any) =>
  ({
    parentNodeUuid,
    nodeDefUuid,
  }: {
    parentNodeUuid: string | undefined;
    nodeDefUuid: string;
  }): Validation | undefined => {
    if (!parentNodeUuid) {
      return undefined;
    }
    const record = selectRecordUnsafe(state);
    if (!record) {
      return undefined;
    }
    const nodeParent = Records.getNodeByUuid(parentNodeUuid)(record)!;
    const nodes = Records.getChildren(nodeParent, nodeDefUuid)(record);
    if (nodes.length === 0) return undefined;

    const node = nodes[0]!;
    const validation = RecordValidations.getValidationNode({
      nodeUuid: node.uuid,
    })(record.validation!);
    return validation;
  };

const selectRecordNodePointerValidationChildrenCount =
  ({
    parentNodeUuid,
    nodeDefUuid,
  }: {
    parentNodeUuid: string | undefined;
    nodeDefUuid: string;
  }) =>
  (state: any): Validation | undefined => {
    if (!parentNodeUuid) {
      return undefined;
    }
    const record = selectRecordUnsafe(state);
    if (!record) {
      return undefined;
    }
    const validationChildrenCount =
      RecordValidations.getValidationChildrenCount({
        nodeParentUuid: parentNodeUuid,
        nodeDefChildUuid: nodeDefUuid,
      })(record.validation!);
    return validationChildrenCount;
  };

const selectRecordNodePointerVisibility =
  ({
    parentNodeUuid,
    nodeDefUuid,
  }: {
    parentNodeUuid: string | undefined;
    nodeDefUuid: string;
  }) =>
  (state: any): boolean => {
    if (!parentNodeUuid) {
      return false;
    }
    const survey = SurveySelectors.selectCurrentSurvey(state)!;
    const record = selectRecordUnsafe(state);
    if (!record) {
      return false;
    }

    const parentNode = Records.getNodeByUuid(parentNodeUuid)(record)!;
    const applicable = Nodes.isChildApplicable(parentNode, nodeDefUuid);
    const nodeDefChild = Surveys.getNodeDefByUuid({
      survey,
      uuid: nodeDefUuid,
    });
    const cycle = record.cycle;
    const hiddenWhenNotRelevant =
      NodeDefs.isHiddenWhenNotRelevant(cycle)(nodeDefChild);
    return applicable || !hiddenWhenNotRelevant;
  };

const selectRecordAttributeInfo =
  ({ nodeUuid }: { nodeUuid: string }) =>
  (
    state: any,
  ): { applicable: boolean; value: any; validation: Validation | null } => {
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
    const value = extractAttibuteValue({ state, attribute });
    const validation = RecordValidations.getValidationNode({ nodeUuid })(
      record.validation!,
    );
    const applicable = Records.isNodeApplicable({ record, node: attribute });
    return { applicable, value, validation };
  };

const selectRecordChildNodes =
  ({ parentNodeUuid, nodeDef }: ParentNodeUuidNodeDefParams) =>
  (state: any): { nodes: ArenaRecordNode[] } => {
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
  (state: any): boolean => {
    const { nodes } = selectRecordChildNodes({ parentNodeUuid, nodeDef })(
      state,
    );
    return (
      nodes.length > 0 && nodes.every((node) => Nodes.isValueNotBlank(node))
    );
  };

const selectChildDefs =
  ({ nodeDef }: { nodeDef: NodeDef<any> }) =>
  (state: any): NodeDef<any>[] => {
    const user = RemoteConnectionSelectors.selectLoggedUser(state);
    const cycle = selectRecordCycle(state);
    const survey = SurveySelectors.selectCurrentSurvey(state);
    const childDefs = SurveyDefs.getChildrenDefs({
      survey,
      nodeDef,
      cycle,
      allowExperimental: Users.isSystemAdmin(user),
    }).filter((childDef) => {
      // only child defs not hidden in mobile and in same page
      const layoutProps = NodeDefs.getLayoutProps(cycle)(childDef);
      return !layoutProps.pageUuid;
    });
    return childDefs;
  };

const selectRecordCodeParentItemUuid =
  ({
    nodeDef,
    parentNodeUuid,
  }: {
    nodeDef: NodeDefCode;
    parentNodeUuid: string | undefined;
  }) =>
  (state: any): string | undefined => {
    const parentCodeDefUuid = NodeDefs.getParentCodeDefUuid(nodeDef);
    if (!parentNodeUuid || !parentCodeDefUuid) {
      return undefined;
    }
    const record = selectRecordUnsafe(state);
    if (!record) {
      return undefined;
    }
    const parentNode = Records.getNodeByUuid(parentNodeUuid)(record)!;
    const parentCodeAttribute = Records.getParentCodeAttribute({
      parentNode,
      nodeDef,
    })(record);
    return parentCodeAttribute
      ? NodeValues.getItemUuid(parentCodeAttribute)
      : undefined;
  };

const selectRecordIsNotValid = (state: any): boolean => {
  const record = selectRecordUnsafe(state);
  const validation = record ? Validations.getValidation(record) : null;
  return !!validation && Validations.isNotValid(validation);
};

const selectRecordHasErrors = (state: any): boolean => {
  const record = selectRecordUnsafe(state);
  const validation = record ? Validations.getValidation(record) : null;
  return !!validation && Validations.getErrorsCount(validation) > 0;
};

const selectCurrentPageEntity = (state: any): RecordCurrentPageEntity => {
  const survey = SurveySelectors.selectCurrentSurvey(state)!;
  const record = selectRecordUnsafe(state);
  if (!record) {
    throw new Error("Record not found");
  }

  const {
    parentEntityUuid,
    entityDefUuid,
    entityUuid,
    previousCycleParentEntityUuid,
    previousCycleEntityUuid,
  } = getDataEntryState(state).recordCurrentPageEntity ?? {};

  if (!parentEntityUuid) {
    const rootDef = Surveys.getNodeDefRoot({ survey });
    return {
      parentEntityUuid: undefined,
      entityDef: rootDef,
      entityDefUuid: rootDef.uuid,
      entityUuid: Records.getRoot(record)?.uuid!,
    };
  }
  if (!entityDefUuid) {
    throw new Error(
      "Invalid current page entity pointer: missing entityDefUuid",
    );
  }
  const entityDef = Surveys.getNodeDefByUuid({
    survey,
    uuid: entityDefUuid,
  })! as NodeDefEntity;

  return {
    parentEntityUuid,
    entityDef,
    entityDefUuid: entityDefUuid,
    entityUuid,
    previousCycleParentEntityUuid,
    previousCycleEntityUuid,
  };
};

const selectCurrentPageEntityRelevantChildDefs = (state: any) => {
  const { parentEntityUuid, entityDef, entityUuid } =
    selectCurrentPageEntity(state);
  const childDefs = selectChildDefs({ nodeDef: entityDef })(state);
  const record = selectRecordUnsafe(state);
  const actualEntityUuid = entityUuid ?? parentEntityUuid;
  if (!actualEntityUuid || !record) {
    return [];
  }
  const parentEntity = Records.getNodeByUuid(actualEntityUuid)(record);
  if (!parentEntity) return [];
  return childDefs.filter((childDef) =>
    Nodes.isChildApplicable(parentEntity, childDef.uuid),
  );
};

const selectCurrentPageEntityActiveChildDefIndex = (state: any): number =>
  getDataEntryState(state).activeChildDefIndex ?? 0;

// record page
const selectRecordPageSelectorMenuOpen = (state: any): boolean =>
  getDataEntryState(state).recordPageSelectorMenuOpen;

// record previous cycle
const selectCanRecordBeLinkedToPreviousCycleRecord = (state: any): boolean => {
  const record = selectRecordUnsafe(state);
  return (record?.cycle ?? "0") > "0";
};

const selectPreviousCycleRecord = (state: any): ArenaRecord | undefined =>
  getDataEntryState(state).previousCycleRecord;

const selectPreviousCycleKey = (state: any): string | undefined =>
  selectPreviousCycleRecord(state)?.cycle;

const selectPreviousCycleRecordLoading = (state: any): boolean =>
  getDataEntryState(state).previousCycleRecordLoading;

const selectIsLinkedToPreviousCycleRecord = (state: any): boolean =>
  getDataEntryState(state).linkToPreviousCycleRecord;

const selectPreviousCycleRecordPageEntity = (
  state: any,
): PreviousCycleRecordPageEntityPointer => {
  const { entityDef } = selectCurrentPageEntity(state);
  if (NodeDefs.isRoot(entityDef)) {
    const previousCycleRecord = selectPreviousCycleRecord(state);
    if (!previousCycleRecord) {
      return {};
    }
    const previousCycleRecordRootEntity = Records.getRoot(previousCycleRecord)!;
    return {
      previousCycleParentEntityUuid: null,
      previousCycleEntityUuid: previousCycleRecordRootEntity.uuid,
    };
  } else {
    return getDataEntryState(state).previousCycleRecordPageEntity;
  }
};

const extractAttibuteValue = ({ state, attribute }: any) => {
  const { nodeDefUuid, value } = attribute ?? {};
  if (!value) return value;
  const survey = SurveySelectors.selectCurrentSurvey(state)!;
  const attributeDef = Surveys.getNodeDefByUuid({ survey, uuid: nodeDefUuid });
  return RecordNodes.cleanupAttributeValue({ value, attributeDef });
};

const selectPreviousCycleRecordAttributeValue =
  ({ nodeDef, parentNodeUuid }: any) =>
  (state: any): any => {
    if (!parentNodeUuid) {
      return null;
    }
    const record = selectPreviousCycleRecord(state);
    if (!record) {
      return null;
    }
    const parentNode = Records.getNodeByUuid(parentNodeUuid)(record)!;
    const attributes = Records.getChildren(parentNode, nodeDef.uuid)(record);
    const attribute = attributes[0];
    return extractAttibuteValue({ state, attribute });
  };

const selectPreviousCycleEntityWithSameKeys =
  ({ entityUuid }: any) =>
  (state: any): any => {
    const survey = SurveySelectors.selectCurrentSurvey(state)!;
    const record = selectRecordUnsafe(state);
    const previousCycleRecord = selectPreviousCycleRecord(state);

    if (!record || !previousCycleRecord) return null;

    return Records.findEntityWithSameKeysInAnotherRecord({
      survey,
      cycle: record.cycle!,
      entityUuid,
      record,
      recordOther: previousCycleRecord,
    });
  };

const useIsNodeDefCurrentActiveChild = (nodeDef: NodeDef<any>): boolean =>
  useSelector((state) => {
    const activeChildDefIndex =
      selectCurrentPageEntityActiveChildDefIndex(state);
    const childDefs = selectCurrentPageEntityRelevantChildDefs(state);
    const nodeDefIndex = childDefs.indexOf(nodeDef);
    return nodeDefIndex === activeChildDefIndex;
  });

const selectIsMaxCountReached =
  ({ parentNodeUuid, nodeDef }: ParentNodeUuidNodeDefParams) =>
  (state: any): boolean => {
    const record = selectRecordUnsafe(state);
    if (!record) {
      return false;
    }
    const parentNode = parentNodeUuid
      ? Records.getNodeByUuid(parentNodeUuid)(record)
      : null;
    if (!parentNode) return false;

    const maxCount = Nodes.getChildrenMaxCount({
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
  useSelector(selectIsMaxCountReached({ parentNodeUuid, nodeDef }));

export const DataEntrySelectors = {
  selectRecord,
  selectCurrentPageEntity,
  selectCurrentPageEntityActiveChildDefIndex,
  selectCurrentPageEntityRelevantChildDefs,
  selectRecordEditLocked,
  selectCanEditRecord,

  useRecord: () => useSelector(selectRecord),

  useRecordEditLockAvailable: () => useSelector(selectRecordEditLockAvailable),

  useRecordEditLocked: () => useSelector(selectRecordEditLocked),

  useCanEditRecord: () => useSelector(selectCanEditRecord),

  useIsEditingRecord: () => useSelector(selectIsEditingRecord),

  useRecordCycle: () => useSelector(selectRecordCycle),

  useRecordRootNodeUuid: () => useSelector(selectRecordRootNodeUuid),

  useRecordSingleNodeUuid: ({ parentNodeUuid, nodeDefUuid }: any) =>
    useSelector(selectRecordSingleNodeUuid({ parentNodeUuid, nodeDefUuid })),

  useRecordEntityChildDefs: ({ nodeDef }: any) =>
    useSelector(selectChildDefs({ nodeDef }), Objects.isEqual),

  useRecordNodePointerValidation: ({ parentNodeUuid, nodeDefUuid }: any) =>
    useSelector(
      (state) =>
        selectRecordNodePointerValidation(state)({
          parentNodeUuid,
          nodeDefUuid,
        }),
      Objects.isEqual,
    ),

  useRecordNodePointerValidationChildrenCount: ({
    parentNodeUuid,
    nodeDefUuid,
  }: any) =>
    useSelector(
      selectRecordNodePointerValidationChildrenCount({
        parentNodeUuid,
        nodeDefUuid,
      }),
      Objects.isEqual,
    ),

  useRecordNodePointerVisibility: ({
    parentNodeUuid,
    nodeDefUuid,
  }: {
    parentNodeUuid: string | undefined;
    nodeDefUuid: string;
  }) =>
    useSelector(
      selectRecordNodePointerVisibility({ parentNodeUuid, nodeDefUuid }),
    ),

  useRecordAttributeInfo: ({ nodeUuid }: any) =>
    useSelector(selectRecordAttributeInfo({ nodeUuid }), Objects.isEqual),

  useRecordChildNodes: ({ parentEntityUuid, nodeDef }: any) =>
    useSelector(
      selectRecordChildNodes({ parentNodeUuid: parentEntityUuid, nodeDef }),
      Objects.isEqual,
    ),

  useIsRecordAttributeFilled: ({
    parentNodeUuid,
    nodeDef,
  }: ParentNodeUuidNodeDefParams) =>
    useSelector(selectIsRecordAttributeFilled({ parentNodeUuid, nodeDef })),

  useRecordEntitiesUuidsAndKeyValues: ({
    parentNodeUuid,
    nodeDefUuid,
  }: {
    parentNodeUuid: string | undefined;
    nodeDefUuid: string;
  }) =>
    useSelector(
      selectRecordEntitiesUuidsAndKeyValues({ parentNodeUuid, nodeDefUuid }),
      Objects.isEqual,
    ),

  useRecordCodeParentItemUuid: ({
    parentNodeUuid,
    nodeDef,
  }: {
    parentNodeUuid: string | undefined;
    nodeDef: NodeDefCode;
  }) =>
    useSelector(selectRecordCodeParentItemUuid({ parentNodeUuid, nodeDef })),

  useRecordIsNotValid: () => useSelector(selectRecordIsNotValid),
  useRecordHasErrors: () => useSelector(selectRecordHasErrors),

  useCurrentPageEntity: () =>
    useSelector(selectCurrentPageEntity, Objects.isEqual),

  useCurrentPageEntityRelevantChildDefs: () =>
    useSelector(selectCurrentPageEntityRelevantChildDefs, Objects.isEqual),

  useCurrentPageEntityActiveChildIndex: () =>
    useSelector(selectCurrentPageEntityActiveChildDefIndex),

  useIsNodeDefCurrentActiveChild,

  selectIsMaxCountReached,
  useIsNodeMaxCountReached,

  // page selector
  selectRecordPageSelectorMenuOpen,
  useIsRecordPageSelectorMenuOpen: () =>
    useSelector(selectRecordPageSelectorMenuOpen),

  // record previous cycle
  usePreviousCycleRecordLoading: () =>
    useSelector(selectPreviousCycleRecordLoading),

  usePreviousCycleKey: () => useSelector(selectPreviousCycleKey),

  usePreviousCycleRecordPageEntity: (): PreviousCycleRecordPageEntityPointer =>
    useSelector(selectPreviousCycleRecordPageEntity, Objects.isEqual),

  useCanRecordBeLinkedToPreviousCycle: () =>
    useSelector(selectCanRecordBeLinkedToPreviousCycleRecord),

  selectIsLinkedToPreviousCycleRecord,
  useIsLinkedToPreviousCycleRecord: () =>
    useSelector(selectIsLinkedToPreviousCycleRecord),

  selectPreviousCycleEntityWithSameKeys,

  selectPreviousCycleRecordAttributeValue,
  usePreviousCycleRecordAttributeValue: ({ nodeDef, parentNodeUuid }: any) =>
    useSelector(
      selectPreviousCycleRecordAttributeValue({ nodeDef, parentNodeUuid }),
    ),
};
