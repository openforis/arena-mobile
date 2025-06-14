import { Surveys } from "@openforis/arena-core";

import { i18n } from "localization";
import { screenKeys } from "screens/screenKeys";
import { PreferencesService, SurveyService } from "service";
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
  ({ survey, preferredLanguage = null, navigation = null }) =>
  async (dispatch) => {
    dispatch({ type: CURRENT_SURVEY_SET, survey, preferredLanguage });
    await PreferencesService.setCurrentSurveyId(survey.id);
    navigation?.navigate(screenKeys.recordsList);
  };

const setCurrentSurveyPreferredLanguage =
  ({ lang }) =>
  async (dispatch, getState) => {
    dispatch({ type: CURRENT_SURVEY_PREFERRED_LANG_SET, lang });
    const state = getState();
    const surveyId = SurveySelectors.selectCurrentSurveyId(state);
    await PreferencesService.setSurveyPreferredLanguage(surveyId, lang);
  };

const setCurrentSurveyCycle =
  ({ cycleKey }) =>
  (dispatch) => {
    dispatch({ type: CURRENT_SURVEY_CYCLE_SET, cycleKey });
  };

const fetchAndSetCurrentSurvey =
  ({ surveyId, preferredLanguage = null, navigation = null }) =>
  async (dispatch) => {
    const survey = await SurveyService.fetchSurveyById(surveyId);
    if (survey) {
      if (!Surveys.isVisibleInMobile(survey)) {
        const status = i18n.t("surveys:status.notVisibleInMobile");
        dispatch(
          MessageActions.setWarning("surveys:statusMessage", { status })
        );
      }
      dispatch(setCurrentSurvey({ survey, preferredLanguage, navigation }));
    } else {
      dispatch(
        MessageActions.setMessage({
          content: "surveys:errorFetchingLocalSurvey",
        })
      );
    }
  };

const fetchAndSetLocalSurveys = () => async (dispatch) => {
  const surveys = await SurveyService.fetchSurveySummariesLocal();
  dispatch({ type: SURVEYS_LOCAL_SET, surveys });
};

const _onSurveyInsertOrUpdate =
  ({ survey, navigation }) =>
  async (dispatch) => {
    dispatch(setCurrentSurvey({ survey, navigation }));
    dispatch(fetchAndSetLocalSurveys());
  };

const importSurveyRemote =
  ({ surveyId, navigation }) =>
  async (dispatch) => {
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
    onComplete = null,
  }) =>
  async (dispatch) => {
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

const deleteSurveys = (surveyIds) => async (dispatch, getState) => {
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
