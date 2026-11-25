import { PreferencesService } from "service/settings/preferencesService";

import { SurveySelectors } from "../survey/selectors";
import type { AppDispatch, AppGetState } from "../store";
import { SurveyOptionsSliceActions } from "./reducer";

const setRecordEditViewMode = (viewMode: string) => (dispatch: AppDispatch) => {
  dispatch(SurveyOptionsSliceActions.setRecordEditViewMode(viewMode));
};

const fetchEntityListColumns =
  ({ surveyId }: { surveyId: number }) =>
  async (dispatch: AppDispatch) => {
    const columnsByEntityDefUuid =
      await PreferencesService.getSurveyEntityListColumns(surveyId);
    dispatch(
      SurveyOptionsSliceActions.setAllEntityListColumns(columnsByEntityDefUuid),
    );
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
    dispatch(
      SurveyOptionsSliceActions.setEntityListColumns({
        entityDefUuid,
        columns,
      }),
    );
    const surveyId = SurveySelectors.selectCurrentSurveyId(getState());
    await PreferencesService.setSurveyEntityListColumns(
      surveyId,
      entityDefUuid,
      columns,
    );
  };

export const SurveyOptionsActions = {
  fetchEntityListColumns,
  setEntityListColumns,
  setRecordEditViewMode,
};
