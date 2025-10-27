import { useSelector } from "react-redux";

import {
  NodeDefEntity,
  NodeDefs,
  Nodes,
  NodeValues,
  Objects,
  Records,
  RecordValidations,
  Surveys,
  Validations,
} from "@openforis/arena-core";

import { RecordNodes, SurveyDefs } from "model";
import { SurveySelectors } from "../survey/selectors";

const getDataEntryState = (state: any) => state.dataEntry;

const selectRecord = (state: any) => getDataEntryState(state).record;

const selectIsEditingRecord = (state: any) => !!selectRecord(state);

const selectRecordEditLocked = (state: any) =>
  !!getDataEntryState(state).recordEditLocked;

const selectIsRecordInDefaultCycle = (state: any) => {
  const survey = SurveySelectors.selectCurrentSurvey(state);
  const defaultCycle = survey ? Surveys.getDefaultCycleKey(survey) : null;
  const record = selectRecord(state);
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

const selectRecordRootNodeUuid = (state: any) => {
  const record = selectRecord(state);
  return Records.getRoot(record)?.uuid;
};

const selectRecordCycle = (state: any) => {
  const record = selectRecord(state);
  return record.cycle;
};

const selectRecordSingleNodeUuid =
  ({ parentNodeUuid, nodeDefUuid }: any) =>
  (state: any) => {
    const record = selectRecord(state);
    const parentNode = Records.getNodeByUuid(parentNodeUuid)(record)!;
    const node = Records.getChild(parentNode, nodeDefUuid)(record);
    return node?.uuid;
  };

const selectRecordEntitiesUuidsAndKeyValues =
  ({ parentNodeUuid, nodeDefUuid }: any) =>
  (state: any) => {
    const record = selectRecord(state);
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
  ({ parentNodeUuid, nodeDefUuid }: any) => {
    const record = selectRecord(state);
    const nodeParent = Records.getNodeByUuid(parentNodeUuid)(record)!;
    const nodes = Records.getChildren(nodeParent, nodeDefUuid)(record);
    if (nodes.length === 0) return undefined;

    const node = nodes[0]!;
    const validation = RecordValidations.getValidationNode({
      nodeUuid: node.uuid,
    })(record.validation);
    return validation;
  };

const selectRecordNodePointerValidationChildrenCount =
  ({ parentNodeUuid, nodeDefUuid }: any) =>
  (state: any) => {
    const record = selectRecord(state);
    const validationChildrenCount =
      RecordValidations.getValidationChildrenCount({
        nodeParentUuid: parentNodeUuid,
        nodeDefChildUuid: nodeDefUuid,
      })(record.validation);
    return validationChildrenCount;
  };

const selectRecordNodePointerVisibility =
  ({ parentNodeUuid, nodeDefUuid }: any) =>
  (state: any) => {
    const survey = SurveySelectors.selectCurrentSurvey(state)!;
    const record = selectRecord(state);

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
  ({ nodeUuid }: any) =>
  (state: any) => {
    const record = selectRecord(state);
    const attribute = Records.getNodeByUuid(nodeUuid)(record);
    if (!attribute) {
      return { applicable: false, value: null, validation: null };
    }
    const value = extractAttibuteValue({ state, attribute });
    const validation = RecordValidations.getValidationNode({ nodeUuid })(
      record.validation
    );
    const applicable = Records.isNodeApplicable({ record, node: attribute });
    return { applicable, value, validation };
  };

const selectRecordChildNodes =
  ({ parentEntityUuid, nodeDef }: any) =>
  (state: any) => {
    const record = selectRecord(state);
    const parentEntity = Records.getNodeByUuid(parentEntityUuid)(record)!;
    const nodes = Records.getChildren(parentEntity, nodeDef.uuid)(record);
    return { nodes };
  };

const selectChildDefs =
  ({ nodeDef }: any) =>
  (state: any) => {
    const cycle = selectRecordCycle(state);
    const survey = SurveySelectors.selectCurrentSurvey(state);
    const childDefs = SurveyDefs.getChildrenDefs({
      survey,
      nodeDef,
      cycle,
    }).filter((childDef) => {
      // only child defs not hidden in mobile and in same page
      const layoutProps = NodeDefs.getLayoutProps(cycle)(childDef);
      return !layoutProps.pageUuid;
    });
    return childDefs;
  };

const selectRecordCodeParentItemUuid =
  ({ nodeDef, parentNodeUuid }: any) =>
  (state: any) => {
    const parentCodeDefUuid = NodeDefs.getParentCodeDefUuid(nodeDef);
    if (!parentCodeDefUuid) return null;

    const record = selectRecord(state);
    const parentNode = Records.getNodeByUuid(parentNodeUuid)(record)!;
    const parentCodeAttribute = Records.getParentCodeAttribute({
      parentNode,
      nodeDef,
    })(record);
    return parentCodeAttribute
      ? NodeValues.getItemUuid(parentCodeAttribute)
      : null;
  };

const selectRecordIsNotValid = (state: any) => {
  const record = selectRecord(state);
  const validation = record ? Validations.getValidation(record) : null;
  return validation && Validations.isNotValid(validation);
};

const selectRecordHasErrors = (state: any) => {
  const record = selectRecord(state);
  const validation = record ? Validations.getValidation(record) : null;
  return validation && Validations.getErrorsCount(validation) > 0;
};

const selectCurrentPageEntity = (
  state: any
): {
  parentEntityUuid?: string;
  entityDef: NodeDefEntity;
  entityUuid: string;
  previousCycleParentEntityUuid?: string;
  previousCycleEntityUuid?: string;
} => {
  const survey = SurveySelectors.selectCurrentSurvey(state)!;
  const record = selectRecord(state);

  const {
    parentEntityUuid,
    entityDefUuid,
    entityUuid,
    previousCycleParentEntityUuid,
    previousCycleEntityUuid,
  } = getDataEntryState(state).recordCurrentPageEntity || {};

  if (!parentEntityUuid) {
    return {
      parentEntityUuid: undefined,
      entityDef: Surveys.getNodeDefRoot({ survey }),
      entityUuid: Records.getRoot(record)?.uuid!,
    };
  }
  const entityDef = Surveys.getNodeDefByUuid({
    survey,
    uuid: entityDefUuid,
  })! as NodeDefEntity;

  return {
    parentEntityUuid,
    entityDef,
    entityUuid,
    previousCycleParentEntityUuid,
    previousCycleEntityUuid,
  };
};

const selectCurrentPageEntityRelevantChildDefs = (state: any) => {
  const { parentEntityUuid, entityDef, entityUuid } =
    selectCurrentPageEntity(state);
  const childDefs = selectChildDefs({ nodeDef: entityDef })(state);
  const record = selectRecord(state);
  const actualEntityUuid = entityUuid ?? parentEntityUuid;
  if (!actualEntityUuid) return [];
  const parentEntity = Records.getNodeByUuid(actualEntityUuid)(record);
  if (!parentEntity) return [];
  return childDefs.filter((childDef) =>
    Nodes.isChildApplicable(parentEntity, childDef.uuid)
  );
};

const selectCurrentPageEntityActiveChildDefIndex = (state: any) =>
  getDataEntryState(state).activeChildDefIndex;

// record page
const selectRecordPageSelectorMenuOpen = (state: any) =>
  getDataEntryState(state).recordPageSelectorMenuOpen;

// record previous cycle
const selectCanRecordBeLinkedToPreviousCycleRecord = (state: any) => {
  const record = selectRecord(state);
  return record?.cycle > "0";
};

const selectPreviousCycleRecord = (state: any) =>
  getDataEntryState(state).previousCycleRecord;

const selectPreviousCycleKey = (state: any) =>
  selectPreviousCycleRecord(state)?.cycle;

const selectPreviousCycleRecordLoading = (state: any) =>
  getDataEntryState(state).previousCycleRecordLoading;

const selectIsLinkedToPreviousCycleRecord = (state: any) =>
  getDataEntryState(state).linkToPreviousCycleRecord;

const selectPreviousCycleRecordPageEntity = (state: any) => {
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
  (state: any) => {
    if (!parentNodeUuid) {
      return null;
    }
    const record = selectPreviousCycleRecord(state);
    const parentNode = Records.getNodeByUuid(parentNodeUuid)(record)!;
    const attributes = Records.getChildren(parentNode, nodeDef.uuid)(record);
    const attribute = attributes[0];
    return extractAttibuteValue({ state, attribute });
  };

const selectPreviousCycleEntityWithSameKeys =
  ({ entityUuid }: any) =>
  (state: any) => {
    const survey = SurveySelectors.selectCurrentSurvey(state)!;
    const record = selectRecord(state);
    const previousCycleRecord = selectPreviousCycleRecord(state);

    if (!record || !previousCycleRecord) return null;

    return Records.findEntityWithSameKeysInAnotherRecord({
      survey,
      cycle: record.cycle,
      entityUuid,
      record,
      recordOther: previousCycleRecord,
    });
  };

const useIsNodeDefCurrentActiveChild = (nodeDef: any) =>
  useSelector((state) => {
    const activeChildDefIndex =
      selectCurrentPageEntityActiveChildDefIndex(state);
    const childDefs = selectCurrentPageEntityRelevantChildDefs(state);
    const nodeDefIndex = childDefs.indexOf(nodeDef);
    return nodeDefIndex === activeChildDefIndex;
  });

const selectIsMaxCountReached =
  ({ parentNodeUuid, nodeDef }: any) =>
  (state: any) => {
    const record = selectRecord(state);
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

const useIsNodeMaxCountReached = ({ parentNodeUuid, nodeDef }: any) =>
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
      Objects.isEqual
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
      Objects.isEqual
    ),

  useRecordNodePointerVisibility: ({ parentNodeUuid, nodeDefUuid }: any) =>
    useSelector(
      selectRecordNodePointerVisibility({ parentNodeUuid, nodeDefUuid })
    ),

  useRecordAttributeInfo: ({ nodeUuid }: any) =>
    useSelector(selectRecordAttributeInfo({ nodeUuid }), Objects.isEqual),

  useRecordChildNodes: ({ parentEntityUuid, nodeDef }: any) =>
    useSelector(
      selectRecordChildNodes({ parentEntityUuid, nodeDef }),
      Objects.isEqual
    ),

  useRecordEntitiesUuidsAndKeyValues: ({ parentNodeUuid, nodeDefUuid }: any) =>
    useSelector(
      selectRecordEntitiesUuidsAndKeyValues({ parentNodeUuid, nodeDefUuid }),
      Objects.isEqual
    ),

  useRecordCodeParentItemUuid: ({ parentNodeUuid, nodeDef }: any) =>
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

  usePreviousCycleRecordPageEntity: () =>
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
      selectPreviousCycleRecordAttributeValue({ nodeDef, parentNodeUuid })
    ),
};
