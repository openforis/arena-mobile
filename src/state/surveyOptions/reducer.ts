import { Objects } from "@openforis/arena-core";

import { StoreUtils } from "../storeUtils";

import { RecordEditViewMode } from "model";
import { SurveyActionTypes } from "../survey/actionTypes";
import { SurveyOptionsActions } from "./actions";
import { SurveyOptionsState } from "./state";

const initialState = {
  [SurveyOptionsState.keys.recordEditViewMode]: RecordEditViewMode.form,
};

const actionHandlers = {
  [SurveyActionTypes.CURRENT_SURVEY_SET]: () => ({ ...initialState }),

  [SurveyOptionsActions.RECORD_EDIT_VIEW_MODE_SET]: ({
    state,
    action,
  }: any) => ({
    ...state,
    [SurveyOptionsState.keys.recordEditViewMode]: action.viewMode,
  }),

  [SurveyOptionsActions.ENTITY_LIST_COLUMNS_ALL_SET]: ({
    state,
    action,
  }: any) => ({
    ...state,
    [SurveyOptionsState.keys.entityListColumnsByEntityDefUuid]:
      action.columnsByEntityDefUuid,
  }),

  [SurveyOptionsActions.ENTITY_LIST_COLUMNS_SET]: ({ state, action }: any) => {
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
