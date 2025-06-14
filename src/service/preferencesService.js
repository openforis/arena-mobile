import { Objects } from "@openforis/arena-core";
import { asyncStorageKeys } from "./asyncStorage/asyncStorageKeys";
import StoredObjectManager from "./storedObjectManager";

const keys = {
  currentSurveyId: "currentSurveyId",
  preferencesBySurveyId: "preferencesBySurveyId",
};

const surveyPreferencesKeys = {
  language: "language",
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

const getPrereferencesBySurveyId = async (surveyId) => {
  const preferencesBySurveyId = await preferencesStoredObjectManager.getValue(
    keys.preferencesBySurveyId
  );
  return preferencesBySurveyId?.[surveyId] || {};
};

const getSurveyPreferredLanguage = async (surveyId) => {
  const preferencesBySurveyId = await getPrereferencesBySurveyId(surveyId);
  return preferencesBySurveyId[surveyPreferencesKeys.language];
};

const clearCurrentSurveyId = async () =>
  await preferencesStoredObjectManager.deleteValue(keys.currentSurveyId);

const updateSurveyPreferences = async (surveyId, updateFn) => {
  const preferencesBySurveyId =
    (await preferencesStoredObjectManager.getValue(
      keys.preferencesBySurveyId
    )) ?? {};
  const preferencesBySurveyIdUpdated = { ...preferencesBySurveyId };
  const surveyPreferences = preferencesBySurveyIdUpdated[surveyId] ?? {};

  const surveyPreferencesUpdated = updateFn(surveyPreferences);

  if (Objects.isEmpty(surveyPreferencesUpdated)) {
    delete preferencesBySurveyIdUpdated[surveyId];
  } else {
    preferencesBySurveyIdUpdated[surveyId] = surveyPreferencesUpdated;
  }
  await preferencesStoredObjectManager.updateValue(
    keys.preferencesBySurveyId,
    preferencesBySurveyIdUpdated
  );
};

const updateSurveyPreference = async (surveyId, key, value) =>
  updateSurveyPreferences(surveyId, (surveyPreferences) => ({
    ...surveyPreferences,
    [key]: value,
  }));

const setSurveyPreferredLanguage = async (surveyId, lang) =>
  updateSurveyPreference(surveyId, surveyPreferencesKeys.language, lang);

const clearPreferencesBySurveyId = async (surveyId) => {
  await updateSurveyPreferences(surveyId, () => ({}));
};

const clearPreferencesBySurveyIds = async (surveyIds) => {
  for (const surveyId of surveyIds) {
    await clearPreferencesBySurveyId(surveyId);
  }
};

export const PreferencesService = {
  getCurrentSurveyId,
  setCurrentSurveyId,
  getSurveyPreferredLanguage,
  clearCurrentSurveyId,
  setSurveyPreferredLanguage,
  clearPreferencesBySurveyId,
  clearPreferencesBySurveyIds,
};
