import {
  Nodes,
  RecordFactory,
  RecordUpdater,
  Survey,
  Surveys,
} from "@openforis/arena-core";

import { SystemUtils } from "utils";

import { RemoteConnectionSelectors } from "../remoteConnection";
import { SurveyActionTypes } from "../survey/actionTypes";
import { DataEntryActionTypes } from "./actionTypes";
import { AreaOfInterestProviderDefault } from "service/areaOfInterestProvider";

type StartPreviewParams = {
  survey: Survey;
  lang?: string | null;
  cycle?: string | null;
};

// sets the previewed survey and a new record kept in memory only (web preview, no local DB)
const startPreview =
  ({ survey, lang = null, cycle = null }: StartPreviewParams) =>
  async (dispatch: any, getState: any) => {
    dispatch({
      type: SurveyActionTypes.CURRENT_SURVEY_SET,
      survey,
      preferredLanguage: lang,
    });
    const cycleKey = cycle ?? Surveys.getDefaultCycleKey(survey);
    dispatch({ type: SurveyActionTypes.CURRENT_SURVEY_CYCLE_SET, cycleKey });
    dispatch({ type: DataEntryActionTypes.DATA_ENTRY_RESET });

    const user = RemoteConnectionSelectors.selectLoggedUserSafe(getState());
    const recordEmpty = RecordFactory.createInstance({
      surveyUuid: survey.uuid,
      cycle: cycleKey,
      user,
      appInfo: SystemUtils.getRecordAppInfo(),
    });
    const { record, nodes } = await RecordUpdater.createRootEntity({
      user,
      survey,
      areaOfInterestProvider: AreaOfInterestProviderDefault,
      record: recordEmpty,
    });
    for (const node of Object.values(nodes)) {
      Nodes.removeStatusFlags({ node, sideEffect: true });
    }
    dispatch({
      type: DataEntryActionTypes.RECORD_SET,
      record: { ...record, surveyId: survey.id },
      recordEditLockAvailable: false,
      recordEditLocked: false,
      recordPageSelectorMenuOpen: false,
    });
  };

export const DataEntryActionsPreview = {
  startPreview,
};
