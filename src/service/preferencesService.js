import { Objects } from "@openforis/arena-core";
import { asyncStorageKeys } from "./asyncStorage/asyncStorageKeys";
import StoredObjectManager from "./storedObjectManager";

const keys = {
  currentSurveyId: "currentSurveyId",
  preferencesBySurveyId: "preferencesBySurveyId",
};

const surveyPreferencesKeys = {
  language: "language",
  lastEditedPageByRecordId: "lastEditedPageByRecordId",
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
  const surveyPreferences = await getPrereferencesBySurveyId(surveyId);
  return surveyPreferences[surveyPreferencesKeys.language];
};

const getSurveyRecordLastEditedPage = async (surveyId, recordId) => {
  const surveyPreferences = await getPrereferencesBySurveyId(surveyId);
  return Objects.path([
    surveyPreferencesKeys.lastEditedPageByRecordId,
    recordId,
  ])(surveyPreferences);
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

const setSurveyRecordLastEditedPage = async (surveyId, recordId, page) =>
  updateSurveyPreferences(surveyId, (surveyPreferences) =>
    Objects.assocPath({
      obj: surveyPreferences,
      path: [surveyPreferencesKeys.lastEditedPageByRecordId, recordId],
      value: page,
    })
  );

const clearSurveyRecordLastEditedPage = async (surveyId, recordId) =>
  updateSurveyPreferences(surveyId, (surveyPreferences) =>
    Objects.dissocPath({
      obj: surveyPreferences,
      path: [surveyPreferencesKeys.lastEditedPageByRecordId, recordId],
    })
  );

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
  getSurveyRecordLastEditedPage,
  clearCurrentSurveyId,
  setSurveyPreferredLanguage,
  setSurveyRecordLastEditedPage,
  clearSurveyRecordLastEditedPage,
  clearPreferencesBySurveyId,
  clearPreferencesBySurveyIds,
};
