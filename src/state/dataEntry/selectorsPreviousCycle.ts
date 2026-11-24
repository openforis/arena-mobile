import {
  ArenaRecord,
  ArenaRecordNode,
  NodeDefs,
  Objects,
  Records,
} from "@openforis/arena-core";

import { SurveySelectors } from "../survey/selectors";
import type { RootState } from "../store";
import { useAppSelector } from "../storeHooks";
import { selectCurrentPageEntity } from "./selectorsPageNavigation";
import {
  extractAttributeValue,
  getDataEntryState,
  ParentNodeUuidNodeDefParams,
  selectRecordUnsafe,
} from "./selectorsRecord";
import { PreviousCycleRecordPageEntityPointer } from "./types";

type PreviousCycleAttributeValuesParams = Omit<
  ParentNodeUuidNodeDefParams,
  "parentNodeUuid"
> & {
  parentNodeUuid: string | null | undefined;
};

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

const selectPreviousCycleRecordAttributeValues =
  ({ nodeDef, parentNodeUuid }: PreviousCycleAttributeValuesParams) =>
  (state: RootState): { uuid: string; value: unknown }[] | null => {
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
      value: extractAttributeValue({ state, attribute }),
    }));
  };

const selectPreviousCycleEntityWithSameKeys =
  ({ entityUuid }: { entityUuid: string | undefined }) =>
  (state: RootState): ArenaRecordNode | null | undefined => {
    const survey = SurveySelectors.selectCurrentSurvey(state)!;
    const record = selectRecordUnsafe(state);
    const previousCycleRecord = selectPreviousCycleRecord(state);

    if (!record || !previousCycleRecord) return null;

    return Records.findEntityWithSameKeysInAnotherRecord(
      survey,
      record.cycle!,
      entityUuid!,
      previousCycleRecord,
    )(record);
  };

export const PreviousCycleSelectors = {
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
  }: PreviousCycleAttributeValuesParams):
    { uuid: string; value: unknown }[] | null =>
    useAppSelector(
      selectPreviousCycleRecordAttributeValues({ nodeDef, parentNodeUuid }),
      Objects.isEqual,
    ),
};
