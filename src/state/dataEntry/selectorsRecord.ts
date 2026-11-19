import {
  ArenaRecord,
  ArenaRecordNode,
  Records,
  Surveys,
  ArenaAnyNodeDef,
} from "@openforis/arena-core";

import { RecordUtils } from "model";
import { ArenaMobileRecord } from "model/ArenaMobileRecord";
import { PreviewMode } from "utils/PreviewMode";

import { SurveySelectors } from "../survey/selectors";
import type { RootState } from "../store";
import { useAppSelector } from "../storeHooks";
import { DataEntryState } from "./types";

export type NodePointerParams = {
  parentNodeUuid: string | undefined;
  nodeDefUuid: string;
};

export type ParentNodeUuidNodeDefParams = {
  parentNodeUuid: string | undefined;
  nodeDef: ArenaAnyNodeDef;
};

export const getDataEntryState = (state: RootState): DataEntryState =>
  state.dataEntry;

export const selectRecordUnsafe = (state: RootState): ArenaRecord | undefined =>
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

export const selectRecordCycle = (state: RootState): string => {
  const record = selectRecordUnsafe(state);
  return record ? Records.getCycle(record) : "0";
};

export const extractAttributeValue = ({
  state,
  attribute,
}: {
  state: RootState;
  attribute: ArenaRecordNode | undefined;
}) => {
  const { nodeDefUuid, value } = attribute ?? {};
  if (!value) return value;
  const survey = SurveySelectors.selectCurrentSurvey(state)!;
  const attributeDef = Surveys.getNodeDefByUuid({
    survey,
    uuid: nodeDefUuid!,
  });
  return RecordUtils.cleanupAttributeValue({ value, attributeDef });
};

export const RecordSelectors = {
  selectRecord,
  selectRecordUnsafe,
  selectRecordEditLocked,
  selectCanEditRecord,
  selectRecordSyncInProgress,

  useRecord: () => useAppSelector(selectRecord),

  useRecordEditLockAvailable: () =>
    useAppSelector(selectRecordEditLockAvailable),

  useRecordEditLocked: () => useAppSelector(selectRecordEditLocked),

  useCanEditRecord: () => useAppSelector(selectCanEditRecord),
  useIsRecordReadOnly: () => useAppSelector(selectIsRecordReadOnly),
  useRecordSyncInProgress: () => useAppSelector(selectRecordSyncInProgress),

  useIsEditingRecord: () => useAppSelector(selectIsEditingRecord),

  useRecordCycle: () => useAppSelector(selectRecordCycle),
};
