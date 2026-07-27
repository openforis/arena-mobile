import { Survey, Surveys, UserGroup } from "@openforis/arena-core";

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
// Any other failure (offline, server error, endpoint not supported yet) is thrown, letting the
// caller fall back to a locally cached value rather than silently treating it as "no group".
const fetchCurrentUserGroupRemote = async ({
  survey,
}: {
  survey: Survey & { remoteId?: number };
}): Promise<UserGroup | null> => {
  const { remoteId } = survey;
  if (!remoteId) return null;
  const { data } = await RemoteService.get(
    `api/survey/${remoteId}/current-user-group`,
  );
  return data?.userGroup ?? null;
};

const getSurveysStorageSize = async () => SurveyFSRepository.getStorageSize();

const importDemoSurvey = async () =>
  _insertSurvey(demoSurvey as unknown as Survey);

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
  importDemoSurvey,
  importSurveyRemote,
  fetchCategoryItems,
  insertSurvey,
  updateSurveyRemote,
  deleteSurveys,
};
