import { StoreUtils } from "../storeUtils";

// @ts-expect-error TS(2307): Cannot find module 'model' or its corresponding ty... Remove this comment to see the full error message
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
    action
  }: any) => ({
    ...state,
    [SurveyOptionsState.keys.recordEditViewMode]: action.viewMode,
  }),
};

export const SurveyOptionsReducer = StoreUtils.exportReducer({
  actionHandlers,
  initialState,
});
