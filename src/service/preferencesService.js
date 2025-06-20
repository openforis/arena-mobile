import { asyncStorageKeys } from "./asyncStorage/asyncStorageKeys";
import StoredObjectManager from "./storedObjectManager";

const keys = {
  currentSurveyId: "currentSurveyId",
};

const preferencesStoredObjectManager = new StoredObjectManager(
  asyncStorageKeys.preferences
);

const getCurrentSurveyId = async () =>
  await preferencesStoredObjectManager.getValue(keys.currentSurveyId);

const setCurrentSurveyId = async (surveyId) => {
  await preferencesStoredObjectManager.updateValue(
    keys.currentSurveyId,
    surveyId
  );
};

const clearCurrentSurveyId = async () =>
  await preferencesStoredObjectManager.deleteValue(keys.currentSurveyId);

export const PreferencesService = {
  getCurrentSurveyId,
  setCurrentSurveyId,
  clearCurrentSurveyId,
};
