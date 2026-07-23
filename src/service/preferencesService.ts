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
  userGroup: "userGroup",
};

const preferencesStoredObjectManager = new StoredObjectManager(
  asyncStorageKeys.preferences
);

const getCurrentSurveyId = async () =>
  await preferencesStoredObjectManager.getValue(keys.currentSurveyId);

const setCurrentSurveyId = async (surveyId: any) => {
  await preferencesStoredObjectManager.updateValue(
    keys.currentSurveyId,
    surveyId
  );
};

const getPrereferencesBySurveyId = async (surveyId: any) => {
  const preferencesBySurveyId = await preferencesStoredObjectManager.getValue(
    keys.preferencesBySurveyId
  );
  return preferencesBySurveyId?.[surveyId] || {};
};

const getSurveyPreferredLanguage = async (surveyId: any) => {
  const surveyPreferences = await getPrereferencesBySurveyId(surveyId);
  return surveyPreferences[surveyPreferencesKeys.language];
};

const getSurveyUserGroup = async (surveyId: any) => {
  const surveyPreferences = await getPrereferencesBySurveyId(surveyId);
  return surveyPreferences[surveyPreferencesKeys.userGroup] ?? null;
};

const getSurveyRecordLastEditedPage = async (surveyId: any, recordId: any) => {
  const surveyPreferences = await getPrereferencesBySurveyId(surveyId);
  return Objects.path([
    surveyPreferencesKeys.lastEditedPageByRecordId,
    recordId,
  ])(surveyPreferences);
};

const clearCurrentSurveyId = async () =>
  await preferencesStoredObjectManager.deleteValue(keys.currentSurveyId);

const updateSurveyPreferences = async (surveyId: any, updateFn: any) => {
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

const updateSurveyPreference = async (surveyId: any, key: any, value: any) =>
  updateSurveyPreferences(surveyId, (surveyPreferences: any) => ({
    ...surveyPreferences,
    [key]: value
  }));

const setSurveyPreferredLanguage = async (surveyId: any, lang: any) =>
  updateSurveyPreference(surveyId, surveyPreferencesKeys.language, lang);

const setSurveyUserGroup = async (surveyId: any, userGroup: any) =>
  updateSurveyPreference(surveyId, surveyPreferencesKeys.userGroup, userGroup);

const setSurveyRecordLastEditedPage = async (surveyId: any, recordId: any, page: any) =>
  updateSurveyPreferences(surveyId, (surveyPreferences: any) => Objects.assocPath({
    obj: surveyPreferences,
    path: [surveyPreferencesKeys.lastEditedPageByRecordId, recordId],
    value: page,
  })
  );

const clearSurveyRecordLastEditedPage = async (surveyId: any, recordId: any) =>
  updateSurveyPreferences(surveyId, (surveyPreferences: any) => Objects.dissocPath({
    obj: surveyPreferences,
    path: [surveyPreferencesKeys.lastEditedPageByRecordId, recordId],
  })
  );

// Cleared on logout (see RemoteConnectionActions logout), so the next user logging in on the
// same device doesn't get the previous user's group/qualifiers as an offline fallback.
const clearSurveyUserGroup = async (surveyId: any) =>
  updateSurveyPreferences(surveyId, (surveyPreferences: any) =>
    Objects.dissocPath({
      obj: surveyPreferences,
      path: [surveyPreferencesKeys.userGroup],
    }),
  );

const clearSurveyUserGroups = async (surveyIds: any) => {
  for (const surveyId of surveyIds) {
    await clearSurveyUserGroup(surveyId);
  }
};

const clearPreferencesBySurveyId = async (surveyId: any) => {
  await updateSurveyPreferences(surveyId, () => ({}));
};

const clearPreferencesBySurveyIds = async (surveyIds: any) => {
  for (const surveyId of surveyIds) {
    await clearPreferencesBySurveyId(surveyId);
  }
};

export const PreferencesService = {
  getCurrentSurveyId,
  setCurrentSurveyId,
  getSurveyPreferredLanguage,
  getSurveyRecordLastEditedPage,
  getSurveyUserGroup,
  clearCurrentSurveyId,
  setSurveyPreferredLanguage,
  setSurveyRecordLastEditedPage,
  setSurveyUserGroup,
  clearSurveyRecordLastEditedPage,
  clearSurveyUserGroups,
  clearPreferencesBySurveyId,
  clearPreferencesBySurveyIds,
};
