const RECORD_EDIT_VIEW_MODE_SET = "RECORD_EDIT_VIEW_MODE_SET";

const setRecordEditViewMode = (viewMode) => (dispatch) => {
  dispatch({ type: RECORD_EDIT_VIEW_MODE_SET, viewMode });
};

export const SurveyOptionsActions = {
  RECORD_EDIT_VIEW_MODE_SET,

  setRecordEditViewMode,
};
