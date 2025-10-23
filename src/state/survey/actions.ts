import { Surveys } from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'localization' or its correspon... Remove this comment to see the full error message
import { i18n } from "localization";
// @ts-expect-error TS(2307): Cannot find module 'screens/screenKeys' or its cor... Remove this comment to see the full error message
import { screenKeys } from "screens/screenKeys";
// @ts-expect-error TS(2307): Cannot find module 'service' or its corresponding ... Remove this comment to see the full error message
import { PreferencesService, SurveyService } from "service";
// @ts-expect-error TS(2307): Cannot find module 'state/message' or its correspo... Remove this comment to see the full error message
import { MessageActions } from "state/message";

import { ConfirmActions } from "../confirm";
import { SurveyActionTypes } from "./actionTypes";
import { SurveySelectors } from "./selectors";

const {
  CURRENT_SURVEY_SET,
  CURRENT_SURVEY_PREFERRED_LANG_SET,
  CURRENT_SURVEY_CYCLE_SET,
  SURVEYS_LOCAL_SET,
} = SurveyActionTypes;

const setCurrentSurvey =
  ({
    survey,
    preferredLanguage = null,
    navigation = null
  }: any) =>
  async (dispatch: any) => {
    dispatch({ type: CURRENT_SURVEY_SET, survey, preferredLanguage });
    await PreferencesService.setCurrentSurveyId(survey.id);
    navigation?.navigate(screenKeys.recordsList);
  };

const setCurrentSurveyPreferredLanguage =
  ({
    lang
  }: any) =>
  async (dispatch: any, getState: any) => {
    dispatch({ type: CURRENT_SURVEY_PREFERRED_LANG_SET, lang });
    const state = getState();
    const surveyId = SurveySelectors.selectCurrentSurveyId(state);
    await PreferencesService.setSurveyPreferredLanguage(surveyId, lang);
  };

const setCurrentSurveyCycle =
  ({
    cycleKey
  }: any) =>
  (dispatch: any) => {
    dispatch({ type: CURRENT_SURVEY_CYCLE_SET, cycleKey });
  };

const fetchAndSetCurrentSurvey =
  ({
    surveyId,
    navigation = null
  }: any) =>
  async (dispatch: any) => {
    const survey = await SurveyService.fetchSurveyById(surveyId);
    if (survey) {
      if (!Surveys.isVisibleInMobile(survey)) {
        const status = i18n.t("surveys:status.notVisibleInMobile");
        dispatch(
          MessageActions.setWarning("surveys:statusMessage", { status })
        );
      }
      const preferredLanguage =
        await PreferencesService.getSurveyPreferredLanguage(surveyId);
      dispatch(setCurrentSurvey({ survey, preferredLanguage, navigation }));
    } else {
      dispatch(
        MessageActions.setMessage({
          content: "surveys:errorFetchingLocalSurvey",
        })
      );
    }
  };

const fetchAndSetLocalSurveys = () => async (dispatch: any) => {
  const surveys = await SurveyService.fetchSurveySummariesLocal();
  dispatch({ type: SURVEYS_LOCAL_SET, surveys });
};

const _onSurveyInsertOrUpdate =
  ({
    survey,
    navigation
  }: any) =>
  async (dispatch: any) => {
    dispatch(setCurrentSurvey({ survey, navigation }));
    dispatch(fetchAndSetLocalSurveys());
  };

const importSurveyRemote =
  ({
    surveyId,
    navigation
  }: any) =>
  async (dispatch: any) => {
    const survey = await SurveyService.importSurveyRemote({ id: surveyId });
    dispatch(_onSurveyInsertOrUpdate({ survey, navigation }));
  };

const updateSurveyRemote =
  ({
    surveyId,
    surveyName,
    surveyRemoteId,
    navigation,
    confirmMessageKey = "surveys:updateSurveyConfirmMessage",
    onConfirm = null,
    onCancel = null,
    onComplete = null
  }: any) =>
  async (dispatch: any) => {
    dispatch(
      ConfirmActions.show({
        confirmButtonTextKey: "surveys:updateSurvey",
        messageKey: confirmMessageKey,
        messageParams: { surveyName },
        onConfirm: async () => {
          dispatch(ConfirmActions.dismiss());
          onConfirm?.();
          const survey = await SurveyService.updateSurveyRemote({
            surveyId,
            surveyRemoteId,
          });
          dispatch(_onSurveyInsertOrUpdate({ survey, navigation }));
          onComplete?.();
        },
        onCancel,
      })
    );
  };

const deleteSurveys = (surveyIds: any) => async (dispatch: any, getState: any) => {
  const state = getState();
  const currentSurveyId = SurveySelectors.selectCurrentSurveyId(state);
  await SurveyService.deleteSurveys(surveyIds);
  dispatch(fetchAndSetLocalSurveys());

  await PreferencesService.clearPreferencesBySurveyIds(surveyIds);

  // reset current survey if among deleted ones
  if (surveyIds.includes(currentSurveyId)) {
    dispatch({ type: CURRENT_SURVEY_SET, survey: null });
    await PreferencesService.clearCurrentSurveyId();
  }
};

export const SurveyActions = {
  setCurrentSurvey,
  setCurrentSurveyPreferredLanguage,
  setCurrentSurveyCycle,
  fetchAndSetCurrentSurvey,
  fetchAndSetLocalSurveys,
  importSurveyRemote,
  updateSurveyRemote,
  deleteSurveys,
};
