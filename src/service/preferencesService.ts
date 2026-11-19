import { Objects, Promises, ArenaUserGroup } from "@openforis/arena-core";
import { asyncStorageKeys } from "./asyncStorage/asyncStorageKeys";
import { StoredObject } from "./asyncStorage/StoredItem";

// record editor page stored to resume editing a record
export type RecordLastEditedPage = {
  parentEntityUuid?: string;
  entityDefUuid: string;
  entityUuid?: string | null;
  locked?: boolean;
};

export type SurveyPreferences = {
  language?: string;
  lastEditedPageByRecordId?: Record<string, RecordLastEditedPage>;
  entityListColumnsByEntityDefUuid?: Record<string, string[]>;
  userGroup?: ArenaUserGroup | null;
};

type Preferences = {
  currentSurveyId?: number;
  lastUsedMapAppId?: string;
  preferencesBySurveyId?: Record<string, SurveyPreferences>;
  whatsNewSeenIds?: string[];
};

type SurveyPreferencesUpdateFn = (
  surveyPreferences: SurveyPreferences,
) => SurveyPreferences;

const keys = {
  currentSurveyId: "currentSurveyId",
  lastUsedMapAppId: "lastUsedMapAppId",
  preferencesBySurveyId: "preferencesBySurveyId",
  whatsNewSeenIds: "whatsNewSeenIds",
} as const satisfies Record<string, keyof Preferences>;

const surveyPreferencesKeys = {
  language: "language",
  lastEditedPageByRecordId: "lastEditedPageByRecordId",
  entityListColumnsByEntityDefUuid: "entityListColumnsByEntityDefUuid",
  userGroup: "userGroup",
} as const satisfies Record<string, keyof SurveyPreferences>;

// record id used as key in the stored preferences
type RecordId = number | undefined;

const preferencesStore = new StoredObject<Preferences>(
  asyncStorageKeys.preferences,
  {},
);

const getCurrentSurveyId = async () =>
  await preferencesStore.getValue(keys.currentSurveyId);

const setCurrentSurveyId = async (surveyId: number) => {
  await preferencesStore.updateValue(keys.currentSurveyId, surveyId);
};

const getPrereferencesBySurveyId = async (
  surveyId: number,
): Promise<SurveyPreferences> => {
  const preferencesBySurveyId = await preferencesStore.getValue(
    keys.preferencesBySurveyId,
  );
  return preferencesBySurveyId?.[surveyId] || {};
};

const getSurveyPreferredLanguage = async (surveyId: number) => {
  const surveyPreferences = await getPrereferencesBySurveyId(surveyId);
  return surveyPreferences[surveyPreferencesKeys.language];
};

const getSurveyUserGroup = async (surveyId: number) => {
  const surveyPreferences = await getPrereferencesBySurveyId(surveyId);
  return surveyPreferences[surveyPreferencesKeys.userGroup] ?? null;
};

const getSurveyRecordLastEditedPage = async (
  surveyId: number,
  recordId: RecordId,
): Promise<RecordLastEditedPage | undefined> => {
  const surveyPreferences = await getPrereferencesBySurveyId(surveyId);
  return Objects.path([
    surveyPreferencesKeys.lastEditedPageByRecordId,
    String(recordId),
  ])(surveyPreferences);
};

const getSurveyEntityListColumns = async (
  surveyId: number,
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

const updateSurveyPreferences = async (
  surveyId: number,
  updateFn: SurveyPreferencesUpdateFn,
) => {
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

const updateSurveyPreference = async <K extends keyof SurveyPreferences>(
  surveyId: number,
  key: K,
  value: SurveyPreferences[K],
) =>
  updateSurveyPreferences(surveyId, (surveyPreferences) => ({
    ...surveyPreferences,
    [key]: value,
  }));

const setSurveyPreferredLanguage = async (surveyId: number, lang: string) =>
  updateSurveyPreference(surveyId, surveyPreferencesKeys.language, lang);

const setSurveyUserGroup = async (
  surveyId: number,
  userGroup: ArenaUserGroup | null,
) =>
  updateSurveyPreference(surveyId, surveyPreferencesKeys.userGroup, userGroup);

const setSurveyRecordLastEditedPage = async (
  surveyId: number,
  recordId: RecordId,
  page: RecordLastEditedPage,
) =>
  updateSurveyPreferences(surveyId, (surveyPreferences) =>
    Objects.assocPath({
      obj: surveyPreferences,
      path: [surveyPreferencesKeys.lastEditedPageByRecordId, String(recordId)],
      value: page,
    }),
  );

const setSurveyEntityListColumns = async (
  surveyId: number,
  entityDefUuid: string,
  columns: string[] | null,
) =>
  updateSurveyPreferences(surveyId, (surveyPreferences) => {
    const path = [
      surveyPreferencesKeys.entityListColumnsByEntityDefUuid,
      entityDefUuid,
    ];
    return columns
      ? Objects.assocPath({ obj: surveyPreferences, path, value: columns })
      : Objects.dissocPath({ obj: surveyPreferences, path });
  });

const clearSurveyRecordLastEditedPage = async (
  surveyId: number,
  recordId: RecordId,
) =>
  updateSurveyPreferences(surveyId, (surveyPreferences) =>
    Objects.dissocPath({
      obj: surveyPreferences,
      path: [surveyPreferencesKeys.lastEditedPageByRecordId, String(recordId)],
    }),
  );

// Cleared on logout (see RemoteConnectionActions logout), so the next user logging in on the
// same device doesn't get the previous user's group/qualifiers as an offline fallback.
const clearSurveyUserGroup = async (surveyId: number) =>
  updateSurveyPreferences(surveyId, (surveyPreferences) =>
    Objects.dissocPath({
      obj: surveyPreferences,
      path: [surveyPreferencesKeys.userGroup],
    }),
  );

const clearSurveyUserGroups = async (surveyIds: number[]) => {
  await Promises.each(surveyIds, async (surveyId) => {
    await clearSurveyUserGroup(surveyId);
  });
};

const clearPreferencesBySurveyId = async (surveyId: number) => {
  await updateSurveyPreferences(surveyId, () => ({}));
};

const clearPreferencesBySurveyIds = async (surveyIds: number[]) => {
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
