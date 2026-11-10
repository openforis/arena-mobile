import { Keyboard } from "react-native";

import { NodeDefs } from "@openforis/arena-core";

import { PreferencesService } from "service/preferencesService";

import { ConfirmActions } from "../confirm";
import { DeviceInfoSelectors } from "../deviceInfo";
import { PositionTrackingActions } from "../positionTracking/actions";
import { SurveySelectors } from "../survey";

import { DataEntryActionsRecordPreviousCycle } from "./actionsRecordPreviousCycle";
import { DataEntryActionTypes } from "./actionTypes";
import { DataEntrySelectors } from "./selectors";
import type { AppDispatch, RootState } from "../store";

const {
  DATA_ENTRY_RESET,
  PAGE_ENTITY_ACTIVE_CHILD_INDEX_SET,
  PAGE_ENTITY_SET,
  PAGE_SELECTOR_MENU_OPEN_SET,
  RECORD_EDIT_LOCKED,
} = DataEntryActionTypes;

const { updatePreviousCyclePageEntity } = DataEntryActionsRecordPreviousCycle;

export const selectCurrentPageEntity =
  ({ parentEntityUuid, entityDefUuid, entityUuid = undefined }: any) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
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

    const payload = {
      parentEntityUuid,
      entityDefUuid,
      entityUuid: nextEntityUuid,
      locked,
    };

    dispatch({ type: PAGE_ENTITY_SET, payload });

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
  (index: any) => (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: PAGE_ENTITY_ACTIVE_CHILD_INDEX_SET, index });
    const state = getState();
    const isPhone = DeviceInfoSelectors.selectIsPhone(state);
    if (isPhone) {
      dispatch(closeRecordPageMenu);
    }
  };

export const toggleRecordPageMenuOpen = (
  dispatch: AppDispatch,
  getState: () => RootState,
) => {
  Keyboard.dismiss();
  const state = getState();
  const open = DataEntrySelectors.selectRecordPageSelectorMenuOpen(state);
  dispatch({ type: PAGE_SELECTOR_MENU_OPEN_SET, open: !open });
};

const closeRecordPageMenu = (
  dispatch: AppDispatch,
  getState: () => RootState,
) => {
  const state = getState();
  const pageSelectorMenuOpen =
    DataEntrySelectors.selectRecordPageSelectorMenuOpen(state);
  if (pageSelectorMenuOpen) {
    dispatch({ type: PAGE_SELECTOR_MENU_OPEN_SET, open: false });
  }
};

export const toggleRecordEditLock = (
  dispatch: AppDispatch,
  getState: () => RootState,
) => {
  Keyboard.dismiss();
  const state = getState();
  const locked = DataEntrySelectors.selectRecordEditLocked(state);
  dispatch({ type: RECORD_EDIT_LOCKED, locked: !locked });
};

export const navigateToRecordsList =
  ({ navigator }: any) =>
  (dispatch: AppDispatch) =>
    dispatch(
      ConfirmActions.show({
        confirmButtonTextKey: "dataEntry:goToListOfRecords",
        messageKey: "dataEntry:confirmGoToListOfRecords",
        onConfirm: async () => {
          // the recorded track is written into the record before closing it
          await dispatch(PositionTrackingActions.closeTrack());
          // pop=true pops the current screen from the stack and avoids going back to it (unmounts the RecordEditor component)
          navigator.navigateToRecordsList({ pop: true });
          dispatch({ type: DATA_ENTRY_RESET });
        },
      }),
    );
