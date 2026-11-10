import { PreferencesService } from "service/preferencesService";

import { SurveySelectors } from "../survey/selectors";
import type { AppDispatch, AppGetState } from "../store";

const RECORD_EDIT_VIEW_MODE_SET = "RECORD_EDIT_VIEW_MODE_SET";
const ENTITY_LIST_COLUMNS_ALL_SET = "ENTITY_LIST_COLUMNS_ALL_SET";
const ENTITY_LIST_COLUMNS_SET = "ENTITY_LIST_COLUMNS_SET";

const setRecordEditViewMode = (viewMode: any) => (dispatch: AppDispatch) => {
  dispatch({ type: RECORD_EDIT_VIEW_MODE_SET, viewMode });
};

const fetchEntityListColumns =
  ({ surveyId }: { surveyId: number }) =>
  async (dispatch: AppDispatch) => {
    const columnsByEntityDefUuid =
      await PreferencesService.getSurveyEntityListColumns(surveyId);
    dispatch({ type: ENTITY_LIST_COLUMNS_ALL_SET, columnsByEntityDefUuid });
  };

// columns: uuids of the visible node defs; null restores the default columns
const setEntityListColumns =
  ({
    entityDefUuid,
    columns,
  }: {
    entityDefUuid: string;
    columns: string[] | null;
  }) =>
  async (dispatch: AppDispatch, getState: AppGetState) => {
    dispatch({ type: ENTITY_LIST_COLUMNS_SET, entityDefUuid, columns });
    const surveyId = SurveySelectors.selectCurrentSurveyId(getState());
    await PreferencesService.setSurveyEntityListColumns(
      surveyId,
      entityDefUuid,
      columns,
    );
  };

export const SurveyOptionsActions = {
  ENTITY_LIST_COLUMNS_ALL_SET,
  ENTITY_LIST_COLUMNS_SET,
  RECORD_EDIT_VIEW_MODE_SET,

  fetchEntityListColumns,
  setEntityListColumns,
  setRecordEditViewMode,
};
