import { screenKeys } from "screens/screenKeys";
import { PreferencesService, SurveyService } from "service";

import { ConfirmActions } from "../confirm";
import { SurveyActionTypes } from "./actionTypes";
import { MessageActions } from "state/message";

const {
  CURRENT_SURVEY_SET,
  CURRENT_SURVEY_PREFERRED_LANG_SET,
  CURRENT_SURVEY_CYCLE_SET,
  SURVEYS_LOCAL_SET,
} = SurveyActionTypes;

const setCurrentSurvey =
  ({ survey, navigation = null }) =>
  async (dispatch) => {
    dispatch({ type: CURRENT_SURVEY_SET, survey });
    await PreferencesService.setCurrentSurveyId(survey.id);
    navigation?.navigate(screenKeys.recordsList);
  };

const setCurrentSurveyPreferredLanguage =
  ({ lang }) =>
  (dispatch) => {
    dispatch({ type: CURRENT_SURVEY_PREFERRED_LANG_SET, lang });
  };

const setCurrentSurveyCycle =
  ({ cycleKey }) =>
  (dispatch) => {
    dispatch({ type: CURRENT_SURVEY_CYCLE_SET, cycleKey });
  };

const fetchAndSetCurrentSurvey =
  ({ surveyId, navigation = null }) =>
  async (dispatch) => {
    const survey = await SurveyService.fetchSurveyById(surveyId);
    if (survey) {
      dispatch(setCurrentSurvey({ survey, navigation }));
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
  const surveyState = state.survey;
  await SurveyService.deleteSurveys(surveyIds);
  dispatch(fetchAndSetLocalSurveys());

  // reset current survey if among deleted ones
  if (surveyIds.includes(surveyState.currentSurvey?.id)) {
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
