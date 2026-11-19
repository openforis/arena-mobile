import {
  ArenaNodeDefEntity,
  RecordNodes,
  Objects,
  Records,
  Surveys,
  ArenaAnyNodeDef,
} from "@openforis/arena-core";

import { createSelector } from "@reduxjs/toolkit";

import { RecordCurrentPageEntity } from "model";
import { RecordCurrentPageEntityPointer } from "model/RecordCurrentPageEntity";

import { SurveySelectors } from "../survey/selectors";
import type { RootState } from "../store";
import { useAppSelector } from "../storeHooks";
import { getDataEntryState, selectRecordUnsafe } from "./selectorsRecord";
import { getChildDefs } from "./selectorsRecordNodes";

const selectCurrentPageEntityPointer = (state: RootState) =>
  getDataEntryState(state).recordCurrentPageEntity;

// memoized: selected by many components on every dispatch
export const selectCurrentPageEntity = createSelector(
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
    }: Partial<RecordCurrentPageEntityPointer> = pointer ?? {};

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
    })! as ArenaNodeDefEntity;

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
  (survey, record, currentPageEntity): ArenaAnyNodeDef[] => {
    const { parentEntityUuid, entityDef, entityUuid } = currentPageEntity;
    const actualEntityUuid = entityUuid ?? parentEntityUuid;
    if (!actualEntityUuid || !record) {
      return [];
    }
    const parentEntity = Records.getNodeByUuid(actualEntityUuid)(record);
    if (!parentEntity) return [];
    const childDefs = getChildDefs({
      survey: survey!,
      cycle: Records.getCycle(record),
      nodeDef: entityDef,
    });
    return childDefs.filter(
      (childDef) =>
        RecordNodes.isChildApplicable(parentEntity, childDef.uuid) &&
        RecordNodes.isChildVisible(parentEntity, childDef.uuid),
    );
  },
);

const selectCurrentPageEntityActiveChildDefIndex = (state: RootState): number =>
  getDataEntryState(state).activeChildDefIndex ?? 0;

const selectCurrentPageEntityActiveChildDefUuid = createSelector(
  [
    selectCurrentPageEntityRelevantChildDefs,
    selectCurrentPageEntityActiveChildDefIndex,
  ],
  (childDefs, activeChildDefIndex): string | undefined =>
    childDefs[activeChildDefIndex]?.uuid,
);

const useIsNodeDefCurrentActiveChild = (nodeDef: ArenaAnyNodeDef): boolean =>
  useAppSelector(
    (state) =>
      // the record may be closed while the editor is being unmounted
      !!selectRecordUnsafe(state) &&
      selectCurrentPageEntityActiveChildDefUuid(state) === nodeDef.uuid,
  );

// record page
const selectRecordPageSelectorMenuOpen = (state: RootState): boolean =>
  getDataEntryState(state).recordPageSelectorMenuOpen;

export const PageNavigationSelectors = {
  selectCurrentPageEntity,
  selectCurrentPageEntityActiveChildDefIndex,
  selectCurrentPageEntityRelevantChildDefs,

  useCurrentPageEntity: () =>
    useAppSelector(selectCurrentPageEntity, Objects.isEqual),

  useCurrentPageEntityRelevantChildDefs: () =>
    useAppSelector(selectCurrentPageEntityRelevantChildDefs, Objects.isEqual),

  useCurrentPageEntityActiveChildIndex: () =>
    useAppSelector(selectCurrentPageEntityActiveChildDefIndex),

  useIsNodeDefCurrentActiveChild,

  // page selector
  selectRecordPageSelectorMenuOpen,
  useIsRecordPageSelectorMenuOpen: () =>
    useAppSelector(selectRecordPageSelectorMenuOpen),
};
