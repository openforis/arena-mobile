import { Objects } from "@openforis/arena-core";

import { ActionHandlers, StoreUtils } from "../storeUtils";

import { RecordEditViewMode } from "model";
import { SurveyActionTypes } from "../survey/actionTypes";
import { SurveyOptionsActions } from "./actions";
import { SurveyOptionsState } from "./state";

const initialState: SurveyOptionsState = {
  recordEditViewMode: RecordEditViewMode.form,
};

const actionHandlers: ActionHandlers<SurveyOptionsState> = {
  [SurveyActionTypes.CURRENT_SURVEY_SET]: () => ({ ...initialState }),

  [SurveyOptionsActions.RECORD_EDIT_VIEW_MODE_SET]: ({ state, action }) => ({
    ...state,
    recordEditViewMode: action.viewMode,
  }),

  [SurveyOptionsActions.ENTITY_LIST_COLUMNS_ALL_SET]: ({ state, action }) => ({
    ...state,
    entityListColumnsByEntityDefUuid: action.columnsByEntityDefUuid,
  }),

  [SurveyOptionsActions.ENTITY_LIST_COLUMNS_SET]: ({ state, action }) => {
    const path = [
      SurveyOptionsState.keys.entityListColumnsByEntityDefUuid,
      action.entityDefUuid,
    ];
    return action.columns
      ? Objects.assocPath({ obj: state, path, value: action.columns })
      : Objects.dissocPath({ obj: state, path });
  },
};

export const SurveyOptionsReducer = StoreUtils.exportReducer({
  actionHandlers,
  initialState,
});
