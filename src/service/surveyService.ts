import { Dates, Survey, Surveys, UserGroup } from "@openforis/arena-core";

import { SurveyRepository } from "./repository/surveyRepository";
import { SurveyFSRepository } from "./repository/surveyFSRepository";
import { RemoteService } from "./remoteService";
import demoSurvey from "./demoSurvey.json";

const {
  fetchSurveySummaries: fetchSurveySummariesLocal,
  insertSurvey,
  updateSurvey,
} = SurveyRepository;

const demoSurveyUuid = "3a3550d2-97ac-4db2-a9b5-ed71ca0a02d3";

const remoteSurveyFetchTimeout = 60000; // 1 min

// Dependency graph is derived from the survey's node defs; rebuild it here,
// the single point where the survey content is persisted to file system,
// so it's cached on disk and doesn't need to be rebuilt on every load.
const storeSurveyInFileSystem = async (survey: Survey): Promise<Survey> => {
  const surveyWithDependencyGraph =
    await Surveys.buildAndAssocDependencyGraph(survey);
  return SurveyFSRepository.saveSurveyFile(surveyWithDependencyGraph);
};

const _insertSurvey = async (survey: Survey): Promise<Survey> => {
  const surveyDb = await insertSurvey(survey);
  return storeSurveyInFileSystem(surveyDb);
};

const _updateSurvey = async ({
  id,
  survey,
}: {
  id: number;
  survey: Survey;
}): Promise<Survey> => {
  const surveyDb = await updateSurvey({ id, survey });
  return storeSurveyInFileSystem(surveyDb);
};

const fetchSurveyById = async (surveyId: number): Promise<Survey> => {
  const surveyDb = await SurveyRepository.fetchSurveyById(surveyId);
  const surveyLoaded = surveyDb.props
    ? surveyDb
    : await SurveyFSRepository.readSurveyFile({ surveyId: surveyDb.id });
  return surveyLoaded;
};

const fetchCategoryItems = ({
  survey,
  categoryUuid,
  parentItemUuid = null,
}: any) => {
  const items = Surveys.getCategoryItems({
    survey,
    categoryUuid,
    parentItemUuid,
  });
  items.sort(
    (itemA, itemB) => (itemA.props.index ?? -1) - (itemB.props.index ?? -1),
  );
  return items;
};

const fetchSurveySummariesRemote = async (): Promise<
  { surveys: any[] } | { errorKey: string }
> => {
  try {
    const { data } = await RemoteService.get("api/surveys", { draft: false });
    const { list: surveys } = data;
    return { surveys };
  } catch (error) {
    return RemoteService.handleError({ error });
  }
};

const fetchSurveySummaryRemote = async ({ id, name }: any) => {
  try {
    const { data } = await RemoteService.get("api/surveys", {
      draft: false,
      search: name,
    });
    const { list: surveys } = data;
    const survey = surveys.find((s: any) => s.id === id);
    return survey;
  } catch (error) {
    return RemoteService.handleError({ error });
  }
};

const fetchSurveyRemoteById = async ({
  id,
}: {
  id: number;
}): Promise<Survey> => {
  const { data } = await RemoteService.get(
    `api/mobile/survey/${id}`,
    {},
    { timeout: remoteSurveyFetchTimeout },
  );
  const { survey } = data;
  return survey;
};

// Each user belongs to at most one UserGroup per survey (see docs/user-group-qualifiers.md).
// The survey may not be linked to a remote server, in which case there's no group to fetch.
// The demo survey is bundled with the app and never exists in the server: its remoteId comes
// from the bundled json and could match the id of an unrelated survey in the server.
// Any other failure (offline, server error, endpoint not supported yet) is thrown, letting the
// caller fall back to a locally cached value rather than silently treating it as "no group".
const fetchCurrentUserGroupRemote = async ({
  survey,
}: {
  survey: Survey & { remoteId?: number };
}): Promise<UserGroup | null> => {
  const { remoteId, uuid } = survey;
  if (!remoteId || uuid === demoSurveyUuid) return null;
  const { data } = await RemoteService.get(
    `api/survey/${remoteId}/current-user-group`,
  );
  return data?.userGroup ?? null;
};

const getSurveysStorageSize = async () => SurveyFSRepository.getStorageSize();

// insert/update and dependency graph building set top-level props (id, remoteId, dependencyGraph)
// of the survey object: always pass a (shallow) copy of the bundled one
const cloneDemoSurvey = (): Survey => ({
  ...(demoSurvey as unknown as Survey),
});

const importDemoSurvey = async () => _insertSurvey(cloneDemoSurvey());

// The demo survey is imported only when no surveys exist locally, so a newer version bundled
// with the app must be applied in place to the already imported one (same local id, so its
// records are kept; they are fixed against the new survey structure when loaded, see RecordFixer).
// The local date_modified column stores datePublished (see SurveyRepository.insertSurvey).
const findOutdatedDemoSurveySummary = <
  T extends { uuid: string; dateModified: string },
>(
  surveySummaries: T[],
): T | undefined => {
  const demoSurveySummary = surveySummaries.find(
    (surveySummary) => surveySummary.uuid === demoSurveyUuid,
  );
  if (!demoSurveySummary) return undefined;
  const demoSurveyDate = demoSurvey.datePublished ?? demoSurvey.dateModified;
  return Dates.isAfter(demoSurveyDate, demoSurveySummary.dateModified)
    ? demoSurveySummary
    : undefined;
};

const updateDemoSurvey = async ({ surveyId }: { surveyId: number }) =>
  _updateSurvey({ id: surveyId, survey: cloneDemoSurvey() });

export type DemoSurveyAction = "import" | "update";

// Imports the demo survey if no surveys exist locally, or updates the local one if outdated.
// onStart is called (e.g. to show progress) only when an action is actually performed.
const importOrUpdateDemoSurvey = async ({
  onStart,
}: {
  onStart?: (action: DemoSurveyAction) => void;
} = {}): Promise<DemoSurveyAction | null> => {
  const surveySummaries = await fetchSurveySummariesLocal();
  if (surveySummaries.length === 0) {
    onStart?.("import");
    await importDemoSurvey();
    return "import";
  }
  const outdatedDemoSurvey = findOutdatedDemoSurveySummary(surveySummaries);
  if (!outdatedDemoSurvey) return null;

  onStart?.("update");
  await updateDemoSurvey({ surveyId: outdatedDemoSurvey.id });
  return "update";
};

const importSurveyRemote = async ({ id }: any) => {
  const survey = await fetchSurveyRemoteById({ id });
  return _insertSurvey(survey);
};

const updateSurveyRemote = async ({ surveyId, surveyRemoteId }: any) => {
  const survey = await fetchSurveyRemoteById({ id: surveyRemoteId });
  return _updateSurvey({ id: surveyId, survey });
};

const deleteSurveys = async (surveyIds: any) => {
  await SurveyRepository.deleteSurveys(surveyIds);
  await Promise.all(
    surveyIds.map((surveyId: any) =>
      SurveyFSRepository.deleteSurveyFile({ surveyId }),
    ),
  );
};

export const SurveyService = {
  demoSurveyUuid,
  fetchSurveyRemoteById,
  fetchSurveySummariesLocal,
  fetchSurveySummariesRemote,
  fetchSurveySummaryRemote,
  fetchSurveyById,
  fetchCurrentUserGroupRemote,
  getSurveysStorageSize,
  importOrUpdateDemoSurvey,
  importSurveyRemote,
  fetchCategoryItems,
  insertSurvey,
  updateSurveyRemote,
  deleteSurveys,
};
