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
  Validation,
  Validations,
} from "@openforis/arena-core";

import { createSelector } from "@reduxjs/toolkit";

import { RecordCurrentPageEntity, RecordUtils, SurveyDefs } from "model";
import { PreviewMode } from "utils/PreviewMode";

import { SurveySelectors } from "../survey/selectors";
import { ArenaMobileRecord } from "model/ArenaMobileRecord";
import { DataEntryState, PreviousCycleRecordPageEntityPointer } from "./types";
import type { RootState } from "../store";
import { useAppSelector } from "../storeHooks";

type ParentNodeUuidNodeDefParams = {
  parentNodeUuid: string | undefined;
  nodeDef: NodeDef<any>;
};

const getDataEntryState = (state: RootState): DataEntryState => state.dataEntry;

const selectRecordUnsafe = (state: RootState): ArenaRecord | undefined =>
  getDataEntryState(state).record;

const selectRecord = (state: RootState): ArenaRecord =>
  selectRecordUnsafe(state)!;

const selectIsEditingRecord = (state: RootState): boolean =>
  !!selectRecordUnsafe(state);

const selectRecordEditLocked = (state: RootState): boolean =>
  !!getDataEntryState(state).recordEditLocked;

const selectRecordSyncInProgress = (state: RootState): boolean =>
  !!getDataEntryState(state).recordSyncInProgress;

const selectIsRecordInDefaultCycle = (state: RootState): boolean => {
  const survey = SurveySelectors.selectCurrentSurvey(state);
  const defaultCycle = survey ? Surveys.getDefaultCycleKey(survey) : null;
  const record = selectRecordUnsafe(state);
  return String(defaultCycle) === String(record?.cycle);
};

// record of another user group (see ArenaMobileRecord.readOnly): it cannot be unlocked
const selectIsRecordReadOnly = (state: RootState): boolean =>
  !!(selectRecordUnsafe(state) as ArenaMobileRecord | undefined)?.readOnly;

const selectRecordEditLockAvailable = (state: RootState) =>
  !!getDataEntryState(state).recordEditLockAvailable &&
  selectIsEditingRecord(state) &&
  selectIsRecordInDefaultCycle(state) &&
  !selectIsRecordReadOnly(state);

const selectCanEditRecord = (state: RootState) => {
  const editLocked = selectRecordEditLocked(state);
  // the web preview record is in the cycle selected in the Arena designer, also when not the default one
  const recordInEditableCycle =
    PreviewMode.isActive || selectIsRecordInDefaultCycle(state);
  return (
    !editLocked &&
    recordInEditableCycle &&
    !selectRecordSyncInProgress(state) &&
    !selectIsRecordReadOnly(state)
  );
};

const selectRecordCycle = (state: RootState): string => {
  const record = selectRecordUnsafe(state);
  return record ? Records.getCycle(record) : "0";
};

const selectRecordSingleNodeUuid =
  ({
    parentNodeUuid,
    nodeDefUuid,
  }: {
    parentNodeUuid: string | undefined;
    nodeDefUuid: string;
  }) =>
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
  ({
    parentNodeUuid,
    nodeDefUuid,
  }: {
    parentNodeUuid: string | undefined;
    nodeDefUuid: string;
  }) =>
  (state: RootState): { uuid: string; keyValues: any }[] => {
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

const selectRecordNodePointerValidation =
  (state: RootState) =>
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
  (state: RootState): Validation | undefined => {
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

const selectRecordNodePointerEditable =
  ({
    parentNodeUuid,
    nodeDefUuid,
  }: {
    parentNodeUuid: string | undefined;
    nodeDefUuid: string;
  }) =>
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
      Nodes.isChildEditable(parentNode, nodeDefUuid)
    );
  };

const selectRecordNodePointerVisibility =
  ({
    parentNodeUuid,
    nodeDefUuid,
  }: {
    parentNodeUuid: string | undefined;
    nodeDefUuid: string;
  }) =>
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
    const applicable = Nodes.isChildApplicable(parentNode, nodeDefUuid);
    const visible = Nodes.isChildVisible(parentNode, nodeDefUuid);
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
      nodes.length > 0 && nodes.every((node) => Nodes.isValueNotBlank(node))
    );
  };

// child defs depend only on survey, cycle and entity def: cached per survey (selected by every form field)
const childDefsCacheBySurvey = new WeakMap<
  object,
  Map<string, NodeDef<any>[]>
>();

const getChildDefs = ({
  survey,
  cycle,
  nodeDef,
}: {
  survey: any;
  cycle: string;
  nodeDef: NodeDefEntity;
}): NodeDef<any>[] => {
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
  ({ nodeDef }: { nodeDef: NodeDefEntity }) =>
  (state: RootState): NodeDef<any>[] =>
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
    nodeDef: NodeDefCode;
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
      ? NodeValues.getItemUuid(parentCodeAttribute)
      : undefined;
  };

const selectRecordIsNotValid = (state: RootState): boolean => {
  const record = selectRecordUnsafe(state);
  const validation = record ? Validations.getValidation(record) : null;
  return !!validation && Validations.isNotValid(validation);
};

const selectRecordHasErrors = (state: RootState): boolean => {
  const record = selectRecordUnsafe(state);
  const validation = record ? Validations.getValidation(record) : null;
  return !!validation && Validations.getErrorsCount(validation) > 0;
};

const selectCurrentPageEntityPointer = (state: RootState) =>
  getDataEntryState(state).recordCurrentPageEntity;

// memoized: selected by many components on every dispatch
const selectCurrentPageEntity = createSelector(
  [
    SurveySelectors.selectCurrentSurvey,
    selectRecordUnsafe,
    selectCurrentPageEntityPointer,
  ],
  (survey, record, pointer): RecordCurrentPageEntity => {
    if (!record) {
      throw new Error("Record not found");
    }
    const {
      parentEntityUuid,
      entityDefUuid,
      entityUuid,
      previousCycleParentEntityUuid,
      previousCycleEntityUuid,
    } = pointer ?? ({} as any);

    if (!parentEntityUuid) {
      const rootDef = Surveys.getNodeDefRoot({ survey: survey! });
      return {
        parentEntityUuid: undefined,
        entityDef: rootDef,
        entityDefUuid: rootDef.uuid,
        entityUuid: Records.getRoot(record)!.uuid,
      };
    }
    if (!entityDefUuid) {
      throw new Error(
        "Invalid current page entity pointer: missing entityDefUuid",
      );
    }
    const entityDef = Surveys.getNodeDefByUuid({
      survey: survey!,
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
  },
);

// memoized: recomputed only when the record or the current page change, not for each field on every dispatch
const selectCurrentPageEntityRelevantChildDefs = createSelector(
  [
    SurveySelectors.selectCurrentSurvey,
    selectRecordUnsafe,
    selectCurrentPageEntity,
  ],
  (survey, record, currentPageEntity): NodeDef<any>[] => {
    const { parentEntityUuid, entityDef, entityUuid } = currentPageEntity;
    const actualEntityUuid = entityUuid ?? parentEntityUuid;
    if (!actualEntityUuid || !record) {
      return [];
    }
    const parentEntity = Records.getNodeByUuid(actualEntityUuid)(record);
    if (!parentEntity) return [];
    const childDefs = getChildDefs({
      survey,
      cycle: Records.getCycle(record),
      nodeDef: entityDef,
    });
    return childDefs.filter(
      (childDef) =>
        Nodes.isChildApplicable(parentEntity, childDef.uuid) &&
        Nodes.isChildVisible(parentEntity, childDef.uuid),
    );
  },
);

const selectCurrentPageEntityActiveChildDefIndex = (state: RootState): number =>
  getDataEntryState(state).activeChildDefIndex ?? 0;

// record page
const selectRecordPageSelectorMenuOpen = (state: RootState): boolean =>
  getDataEntryState(state).recordPageSelectorMenuOpen;

// record previous cycle
const selectCanRecordBeLinkedToPreviousCycleRecord = (
  state: RootState,
): boolean => {
  const record = selectRecordUnsafe(state);
  return (record?.cycle ?? "0") > "0";
};

const selectPreviousCycleRecord = (state: RootState): ArenaRecord | undefined =>
  getDataEntryState(state).previousCycleRecord;

const selectPreviousCycleKey = (state: RootState): string | undefined =>
  selectPreviousCycleRecord(state)?.cycle;

const selectPreviousCycleRecordLoading = (state: RootState): boolean =>
  getDataEntryState(state).previousCycleRecordLoading;

const selectIsLinkedToPreviousCycleRecord = (state: RootState): boolean =>
  getDataEntryState(state).linkToPreviousCycleRecord;

const selectPreviousCycleRecordPageEntity = (
  state: RootState,
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
  return RecordUtils.cleanupAttributeValue({ value, attributeDef });
};

const selectPreviousCycleRecordAttributeValues =
  ({ nodeDef, parentNodeUuid }: any) =>
  (state: RootState): { uuid: string; value: any }[] | null => {
    if (!parentNodeUuid) {
      return null;
    }
    const record = selectPreviousCycleRecord(state);
    if (!record) {
      return null;
    }
    const parentNode = Records.getNodeByUuid(parentNodeUuid)(record)!;
    const attributes = Records.getChildren(parentNode, nodeDef.uuid)(record);
    return attributes.map((attribute) => ({
      uuid: attribute.uuid,
      value: extractAttibuteValue({ state, attribute }),
    }));
  };

const selectPreviousCycleEntityWithSameKeys =
  ({ entityUuid }: any) =>
  (state: RootState): any => {
    const survey = SurveySelectors.selectCurrentSurvey(state)!;
    const record = selectRecordUnsafe(state);
    const previousCycleRecord = selectPreviousCycleRecord(state);

    if (!record || !previousCycleRecord) return null;

    return Records.findEntityWithSameKeysInAnotherRecord(
      survey,
      record.cycle!,
      entityUuid,
      previousCycleRecord,
    )(record);
  };

// shared by the progress bars (app bar and drawer): computed once per record change
const selectRecordCompletionPercent = createSelector(
  [SurveySelectors.selectCurrentSurvey, selectRecordUnsafe],
  (survey, record): number => {
    if (!survey || !record) return 0;
    const rootEntity = Records.getRoot(record);
    if (!rootEntity) return 0;
    const completionStats = Records.getEntityCompletionStats({
      survey,
      record,
      entity: rootEntity,
    });
    return RecordUtils.toCompletionPercent(completionStats);
  },
);

const selectCurrentPageEntityActiveChildDefUuid = createSelector(
  [
    selectCurrentPageEntityRelevantChildDefs,
    selectCurrentPageEntityActiveChildDefIndex,
  ],
  (childDefs, activeChildDefIndex): string | undefined =>
    childDefs[activeChildDefIndex]?.uuid,
);

const useIsNodeDefCurrentActiveChild = (nodeDef: NodeDef<any>): boolean =>
  useAppSelector(
    (state) =>
      // the record may be closed while the editor is being unmounted
      !!selectRecordUnsafe(state) &&
      selectCurrentPageEntityActiveChildDefUuid(state) === nodeDef.uuid,
  );

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
  useAppSelector(selectIsMaxCountReached({ parentNodeUuid, nodeDef }));

export const DataEntrySelectors = {
  selectRecord,
  selectRecordUnsafe,
  selectCurrentPageEntity,
  selectCurrentPageEntityActiveChildDefIndex,
  selectCurrentPageEntityRelevantChildDefs,
  selectRecordEditLocked,
  selectCanEditRecord,
  selectRecordSyncInProgress,
  selectRecordNodePointerEditable,

  useRecord: () => useAppSelector(selectRecord),

  useRecordEditLockAvailable: () =>
    useAppSelector(selectRecordEditLockAvailable),

  useRecordEditLocked: () => useAppSelector(selectRecordEditLocked),

  useCanEditRecord: () => useAppSelector(selectCanEditRecord),
  useIsRecordReadOnly: () => useAppSelector(selectIsRecordReadOnly),
  useRecordSyncInProgress: () => useAppSelector(selectRecordSyncInProgress),

  useIsEditingRecord: () => useAppSelector(selectIsEditingRecord),

  useRecordCycle: () => useAppSelector(selectRecordCycle),

  useRecordSingleNodeUuid: ({ parentNodeUuid, nodeDefUuid }: any) =>
    useAppSelector(selectRecordSingleNodeUuid({ parentNodeUuid, nodeDefUuid })),

  useRecordEntityChildDefs: ({ nodeDef }: any) =>
    useAppSelector(selectChildDefs({ nodeDef }), Objects.isEqual),

  useRecordNodePointerValidation: ({ parentNodeUuid, nodeDefUuid }: any) =>
    useAppSelector(
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
    useAppSelector(
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
    useAppSelector(
      selectRecordNodePointerVisibility({ parentNodeUuid, nodeDefUuid }),
    ),

  useRecordNodePointerEditable: ({
    parentNodeUuid,
    nodeDefUuid,
  }: {
    parentNodeUuid: string | undefined;
    nodeDefUuid: string;
  }) =>
    useAppSelector(
      selectRecordNodePointerEditable({ parentNodeUuid, nodeDefUuid }),
    ),

  useRecordAttributeInfo: ({ nodeUuid }: any) =>
    useAppSelector(selectRecordAttributeInfo({ nodeUuid }), Objects.isEqual),

  useRecordChildNodes: ({ parentEntityUuid, nodeDef }: any) =>
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
  }: {
    parentNodeUuid: string | undefined;
    nodeDefUuid: string;
  }) =>
    useAppSelector(
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
    useAppSelector(selectRecordCodeParentItemUuid({ parentNodeUuid, nodeDef })),

  useRecordIsNotValid: () => useAppSelector(selectRecordIsNotValid),
  useRecordHasErrors: () => useAppSelector(selectRecordHasErrors),
  useRecordCompletionPercent: () =>
    useAppSelector(selectRecordCompletionPercent),

  useCurrentPageEntity: () =>
    useAppSelector(selectCurrentPageEntity, Objects.isEqual),

  useCurrentPageEntityRelevantChildDefs: () =>
    useAppSelector(selectCurrentPageEntityRelevantChildDefs, Objects.isEqual),

  useCurrentPageEntityActiveChildIndex: () =>
    useAppSelector(selectCurrentPageEntityActiveChildDefIndex),

  useIsNodeDefCurrentActiveChild,

  selectIsMaxCountReached,
  useIsNodeMaxCountReached,

  // page selector
  selectRecordPageSelectorMenuOpen,
  useIsRecordPageSelectorMenuOpen: () =>
    useAppSelector(selectRecordPageSelectorMenuOpen),

  // record previous cycle
  usePreviousCycleRecordLoading: () =>
    useAppSelector(selectPreviousCycleRecordLoading),

  usePreviousCycleKey: () => useAppSelector(selectPreviousCycleKey),

  usePreviousCycleRecordPageEntity: (): PreviousCycleRecordPageEntityPointer =>
    useAppSelector(selectPreviousCycleRecordPageEntity, Objects.isEqual),

  useCanRecordBeLinkedToPreviousCycle: () =>
    useAppSelector(selectCanRecordBeLinkedToPreviousCycleRecord),

  selectIsLinkedToPreviousCycleRecord,
  useIsLinkedToPreviousCycleRecord: () =>
    useAppSelector(selectIsLinkedToPreviousCycleRecord),

  selectPreviousCycleRecord,
  selectPreviousCycleEntityWithSameKeys,

  usePreviousCycleRecordAttributeValues: ({
    nodeDef,
    parentNodeUuid,
  }: any): { uuid: string; value: any }[] | null =>
    useAppSelector(
      selectPreviousCycleRecordAttributeValues({ nodeDef, parentNodeUuid }),
      Objects.isEqual,
    ),
};
