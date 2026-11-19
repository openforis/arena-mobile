import {
  LanguageCode,
  RecordNodes,
  RecordFactory,
  RecordUpdater,
  ArenaSurvey,
  Surveys,
} from "@openforis/arena-core";

import { SystemUtils } from "utils";

import { RemoteConnectionSelectors } from "../remoteConnection";
import { SurveySliceActions } from "../survey/reducer";
import { DataEntrySliceActions } from "./reducer";
import { selectRecordUpdaterParams } from "./recordUpdaterParams";
import type { AppDispatch, AppGetState } from "../store";

type StartPreviewParams = {
  survey: ArenaSurvey;
  lang?: string | null;
  cycle?: string | null;
};

// sets the previewed survey and a new record kept in memory only (web preview, no local DB)
const startPreview =
  ({ survey, lang = null, cycle = null }: StartPreviewParams) =>
  async (dispatch: AppDispatch, getState: AppGetState) => {
    dispatch(
      SurveySliceActions.currentSurveySet({
        survey,
        preferredLanguage: lang as LanguageCode | null,
      }),
    );
    const cycleKey = cycle ?? Surveys.getDefaultCycleKey(survey);
    dispatch(SurveySliceActions.currentSurveyCycleSet(cycleKey));
    dispatch(DataEntrySliceActions.reset());

    const user = RemoteConnectionSelectors.selectLoggedUserSafe(getState());
    const recordEmpty = RecordFactory.createInstance({
      surveyUuid: survey.uuid,
      cycle: cycleKey,
      user,
      appInfo: SystemUtils.getRecordAppInfo(),
    });
    const { record, nodes } = await RecordUpdater.createRootEntity({
      ...selectRecordUpdaterParams(getState()),
      record: recordEmpty,
    });
    for (const node of Object.values(nodes)) {
      RecordNodes.removeStatusFlags({ node, sideEffect: true });
    }
    dispatch(
      DataEntrySliceActions.recordSet({
        record: { ...record, surveyId: survey.id },
        recordEditLockAvailable: false,
        recordEditLocked: false,
        recordPageSelectorMenuOpen: false,
      }),
    );
  };

export const DataEntryActionsPreview = {
  startPreview,
};
