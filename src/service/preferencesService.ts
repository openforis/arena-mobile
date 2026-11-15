import { Objects, Promises } from "@openforis/arena-core";
import { asyncStorageKeys } from "./asyncStorage/asyncStorageKeys";
import { StoredObject } from "./asyncStorage/StoredItem";

const keys = {
  currentSurveyId: "currentSurveyId",
  lastUsedMapAppId: "lastUsedMapAppId",
  preferencesBySurveyId: "preferencesBySurveyId",
  whatsNewSeenIds: "whatsNewSeenIds",
};

const surveyPreferencesKeys = {
  language: "language",
  lastEditedPageByRecordId: "lastEditedPageByRecordId",
  entityListColumnsByEntityDefUuid: "entityListColumnsByEntityDefUuid",
  userGroup: "userGroup",
};

const preferencesStore = new StoredObject<Record<string, any>>(
  asyncStorageKeys.preferences,
  {},
);

const getCurrentSurveyId = async () =>
  await preferencesStore.getValue(keys.currentSurveyId);

const setCurrentSurveyId = async (surveyId: any) => {
  await preferencesStore.updateValue(keys.currentSurveyId, surveyId);
};

const getPrereferencesBySurveyId = async (surveyId: any) => {
  const preferencesBySurveyId = await preferencesStore.getValue(
    keys.preferencesBySurveyId,
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

const getSurveyEntityListColumns = async (
  surveyId: any,
): Promise<Record<string, string[]>> => {
  const surveyPreferences = await getPrereferencesBySurveyId(surveyId);
  return (
    surveyPreferences[surveyPreferencesKeys.entityListColumnsByEntityDefUuid] ??
    {}
  );
};

const getLastUsedMapAppId = async (): Promise<string | undefined> =>
  await preferencesStore.getValue(keys.lastUsedMapAppId);

const setLastUsedMapAppId = async (appId: string) => {
  await preferencesStore.updateValue(keys.lastUsedMapAppId, appId);
};

const getWhatsNewSeenIds = async (): Promise<string[]> =>
  (await preferencesStore.getValue(keys.whatsNewSeenIds)) ?? [];

const setWhatsNewSeenIds = async (ids: string[]) => {
  await preferencesStore.updateValue(keys.whatsNewSeenIds, ids);
};

const clearCurrentSurveyId = async () =>
  await preferencesStore.deleteValue(keys.currentSurveyId);

const updateSurveyPreferences = async (surveyId: any, updateFn: any) => {
  await preferencesStore.update((preferences) => {
    const preferencesBySurveyIdUpdated = {
      ...preferences[keys.preferencesBySurveyId],
    };
    const surveyPreferences = preferencesBySurveyIdUpdated[surveyId] ?? {};

    const surveyPreferencesUpdated = updateFn(surveyPreferences);

    if (Objects.isEmpty(surveyPreferencesUpdated)) {
      delete preferencesBySurveyIdUpdated[surveyId];
    } else {
      preferencesBySurveyIdUpdated[surveyId] = surveyPreferencesUpdated;
    }
    return {
      ...preferences,
      [keys.preferencesBySurveyId]: preferencesBySurveyIdUpdated,
    };
  });
};

const updateSurveyPreference = async (surveyId: any, key: any, value: any) =>
  updateSurveyPreferences(surveyId, (surveyPreferences: any) => ({
    ...surveyPreferences,
    [key]: value,
  }));

const setSurveyPreferredLanguage = async (surveyId: any, lang: any) =>
  updateSurveyPreference(surveyId, surveyPreferencesKeys.language, lang);

const setSurveyUserGroup = async (surveyId: any, userGroup: any) =>
  updateSurveyPreference(surveyId, surveyPreferencesKeys.userGroup, userGroup);

const setSurveyRecordLastEditedPage = async (
  surveyId: any,
  recordId: any,
  page: any,
) =>
  updateSurveyPreferences(surveyId, (surveyPreferences: any) =>
    Objects.assocPath({
      obj: surveyPreferences,
      path: [surveyPreferencesKeys.lastEditedPageByRecordId, recordId],
      value: page,
    }),
  );

const setSurveyEntityListColumns = async (
  surveyId: any,
  entityDefUuid: string,
  columns: string[] | null,
) =>
  updateSurveyPreferences(surveyId, (surveyPreferences: any) => {
    const path = [
      surveyPreferencesKeys.entityListColumnsByEntityDefUuid,
      entityDefUuid,
    ];
    return columns
      ? Objects.assocPath({ obj: surveyPreferences, path, value: columns })
      : Objects.dissocPath({ obj: surveyPreferences, path });
  });

const clearSurveyRecordLastEditedPage = async (surveyId: any, recordId: any) =>
  updateSurveyPreferences(surveyId, (surveyPreferences: any) =>
    Objects.dissocPath({
      obj: surveyPreferences,
      path: [surveyPreferencesKeys.lastEditedPageByRecordId, recordId],
    }),
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
  await Promises.each(surveyIds, async (surveyId) => {
    await clearSurveyUserGroup(surveyId);
  });
};

const clearPreferencesBySurveyId = async (surveyId: any) => {
  await updateSurveyPreferences(surveyId, () => ({}));
};

const clearPreferencesBySurveyIds = async (surveyIds: any) => {
  await Promises.each(surveyIds, async (surveyId) => {
    await clearPreferencesBySurveyId(surveyId);
  });
};

export const PreferencesService = {
  getCurrentSurveyId,
  setCurrentSurveyId,
  getLastUsedMapAppId,
  setLastUsedMapAppId,
  getWhatsNewSeenIds,
  setWhatsNewSeenIds,
  getSurveyEntityListColumns,
  getSurveyPreferredLanguage,
  getSurveyRecordLastEditedPage,
  getSurveyUserGroup,
  clearCurrentSurveyId,
  setSurveyEntityListColumns,
  setSurveyPreferredLanguage,
  setSurveyRecordLastEditedPage,
  setSurveyUserGroup,
  clearSurveyRecordLastEditedPage,
  clearSurveyUserGroups,
  clearPreferencesBySurveyIds,
};
