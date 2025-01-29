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

  [SurveyOptionsActions.RECORD_EDIT_VIEW_MODE_SET]: ({ state, action }) => ({
    ...state,
    [SurveyOptionsState.keys.recordEditViewMode]: action.viewMode,
  }),
};

export const SurveyOptionsReducer = StoreUtils.exportReducer({
  actionHandlers,
  initialState,
});
