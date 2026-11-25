import { Keyboard } from "react-native";

import { NodeDefs } from "@openforis/arena-core";

import { PreferencesService } from "service/settings/preferencesService";

import { ConfirmActions } from "../confirm";
import { DeviceInfoSelectors } from "../deviceInfo";
import { PositionTrackingActions } from "../positionTracking/actions";
import { SurveySelectors } from "../survey";

import { DataEntryActionsRecordPreviousCycle } from "./actionsRecordPreviousCycle";
import { updateRecordAppInfoDependents } from "./actionsRecordAppInfo";
import { DataEntrySliceActions } from "./reducer";
import { DataEntrySelectors } from "./selectors";
import type { Navigator } from "navigation/navigator";
import type { AppDispatch, AppGetState } from "../store";

const { updatePreviousCyclePageEntity } = DataEntryActionsRecordPreviousCycle;

export const selectCurrentPageEntity =
  ({
    parentEntityUuid,
    entityDefUuid,
    entityUuid = undefined,
  }: {
    parentEntityUuid?: string | null;
    entityDefUuid: string;
    entityUuid?: string | null;
  }) =>
  async (dispatch: AppDispatch, getState: AppGetState) => {
    const state = getState();
    const surveyId = SurveySelectors.selectCurrentSurveyId(state);
    const record = DataEntrySelectors.selectRecord(state);
    const { id: recordId } = record;
    const { entityDef: prevEntityDef, entityUuid: prevEntityUuid } =
      DataEntrySelectors.selectCurrentPageEntity(state);
    const isPhone = DeviceInfoSelectors.selectIsPhone(state);
    const locked = DataEntrySelectors.selectRecordEditLocked(state);

    const nextEntityUuid =
      entityDefUuid === prevEntityDef.uuid &&
      entityUuid === prevEntityUuid &&
      NodeDefs.isMultiple(prevEntityDef)
        ? null // set pointer to list of entities
        : entityUuid;

    if (!!nextEntityUuid && nextEntityUuid === prevEntityUuid) {
      // same entity selected (e.g. single entity from breadcrumb): do nothing
      return;
    }

    // null uuids (root entity parent, list of entities) are not part of the pointer type yet
    const payload = {
      parentEntityUuid: parentEntityUuid as string | undefined,
      entityDefUuid,
      entityUuid: nextEntityUuid as string | undefined,
      locked,
    };

    dispatch(DataEntrySliceActions.pageEntitySet(payload));

    if (DataEntrySelectors.selectIsLinkedToPreviousCycleRecord(state)) {
      dispatch(updatePreviousCyclePageEntity);
    }

    if (isPhone) {
      dispatch(closeRecordPageMenu);
    }
    await PreferencesService.setSurveyRecordLastEditedPage(
      surveyId,
      recordId,
      payload,
    );
  };

export const selectCurrentPageEntityActiveChildIndex =
  (index: number) => (dispatch: AppDispatch, getState: AppGetState) => {
    dispatch(DataEntrySliceActions.pageEntityActiveChildIndexSet(index));
    const state = getState();
    const isPhone = DeviceInfoSelectors.selectIsPhone(state);
    if (isPhone) {
      dispatch(closeRecordPageMenu);
    }
  };

export const toggleRecordPageMenuOpen = (
  dispatch: AppDispatch,
  getState: AppGetState,
) => {
  Keyboard.dismiss();
  const state = getState();
  const open = DataEntrySelectors.selectRecordPageSelectorMenuOpen(state);
  dispatch(DataEntrySliceActions.pageSelectorMenuOpenSet(!open));
};

const closeRecordPageMenu = (dispatch: AppDispatch, getState: AppGetState) => {
  const state = getState();
  const pageSelectorMenuOpen =
    DataEntrySelectors.selectRecordPageSelectorMenuOpen(state);
  if (pageSelectorMenuOpen) {
    dispatch(DataEntrySliceActions.pageSelectorMenuOpenSet(false));
  }
};

export const toggleRecordEditLock = (
  dispatch: AppDispatch,
  getState: AppGetState,
) => {
  Keyboard.dismiss();
  const state = getState();
  const locked = DataEntrySelectors.selectRecordEditLocked(state);
  dispatch(DataEntrySliceActions.recordEditLockedSet(!locked));
  if (locked) {
    void dispatch(updateRecordAppInfoDependents);
  }
};

export const navigateToRecordsList =
  ({ navigator }: { navigator: Navigator }) =>
  (dispatch: AppDispatch) =>
    dispatch(
      ConfirmActions.show({
        confirmButtonTextKey: "dataEntry:goToListOfRecords",
        messageKey: "dataEntry:confirmGoToListOfRecords",
        onConfirm: async () => {
          // the recorded track is written into the record before closing it
          await dispatch(PositionTrackingActions.closeTrack());
          // pop=true pops the current screen from the stack and avoids going back to it (unmounts the RecordEditorScreen component)
          navigator.navigateToRecordsList({ pop: true });
          dispatch(DataEntrySliceActions.reset());
        },
      }),
    );
