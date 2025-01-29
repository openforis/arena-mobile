import { Surveys } from "@openforis/arena-core";

import { SurveyRepository } from "./repository/surveyRepository";
import { SurveyFSRepository } from "./repository/surveyFSRepository";
import { RemoteService } from "./remoteService";
import demoSurvey from "./simple_survey.json";

const {
  fetchSurveySummaries: fetchSurveySummariesLocal,
  insertSurvey,
  updateSurvey,
} = SurveyRepository;

const _insertSurvey = async (survey) => {
  const surveyDb = await insertSurvey(survey);
  return SurveyFSRepository.saveSurveyFile(surveyDb);
};

const _updateSurvey = async ({ id, survey }) => {
  const surveyDb = await updateSurvey({ id, survey });
  return SurveyFSRepository.saveSurveyFile(surveyDb);
};

const fetchSurveyById = async (surveyId) => {
  const surveyDb = await SurveyRepository.fetchSurveyById(surveyId);
  return surveyDb.props
    ? surveyDb
    : SurveyFSRepository.readSurveyFile({ surveyId: surveyDb.id });
};

const fetchCategoryItems = ({
  survey,
  categoryUuid,
  parentItemUuid = null,
}) => {
  const items = Surveys.getCategoryItems({
    survey,
    categoryUuid,
    parentItemUuid,
  });
  items.sort((itemA, itemB) => itemA.props.index - itemB.props.index);
  return items;
};

const fetchSurveySummariesRemote = async () => {
  try {
    const { data } = await RemoteService.get("api/surveys", { draft: false });
    const { list: surveys } = data;
    return { surveys };
  } catch (error) {
    return RemoteService.handleError({ error });
  }
};

const fetchSurveySummaryRemote = async ({ id, name }) => {
  try {
    const { data } = await RemoteService.get("api/surveys", {
      draft: false,
      search: name,
    });
    const { list: surveys } = data;
    const survey = surveys.find((s) => s.id === id);
    return survey;
  } catch (error) {
    return RemoteService.handleError({ error });
  }
};

const fetchSurveyRemoteById = async ({ id }) => {
  const { data } = await RemoteService.get(`api/mobile/survey/${id}`);
  const { survey } = data;
  return survey;
};

const getSurveysStorageSize = async () => SurveyFSRepository.getStorageSize();

const importDemoSurvey = async () => _insertSurvey(demoSurvey);

const importSurveyRemote = async ({ id }) => {
  const survey = await fetchSurveyRemoteById({ id });
  return _insertSurvey(survey);
};

const updateSurveyRemote = async ({ surveyId, surveyRemoteId }) => {
  const survey = await fetchSurveyRemoteById({ id: surveyRemoteId });
  return _updateSurvey({ id: surveyId, survey });
};

const deleteSurveys = async (surveyIds) => {
  await SurveyRepository.deleteSurveys(surveyIds);
  await Promise.all(
    surveyIds.map((surveyId) =>
      SurveyFSRepository.deleteSurveyFile({ surveyId })
    )
  );
};

export const SurveyService = {
  fetchSurveyRemoteById,
  fetchSurveySummariesLocal,
  fetchSurveySummariesRemote,
  fetchSurveySummaryRemote,
  fetchSurveyById,
  getSurveysStorageSize,
  importDemoSurvey,
  importSurveyRemote,
  fetchCategoryItems,
  insertSurvey,
  updateSurveyRemote,
  deleteSurveys,
};
