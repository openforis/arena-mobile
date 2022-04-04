import API from 'infra/api';

const getSurveys = async ({serverUrl}) => {
  const {data} = await API({serverUrl}).get({path: 'api/surveys'});
  const {list} = data;
  return list;
};

const getSurveyById = async ({serverUrl, surveyId}) => {
  const {data: survey} = await API({serverUrl}).get({
    path: `api/survey/${surveyId}`,
  });
  return survey;
};

const getNodeDefs = async ({serverUrl, surveyId}) => {
  const {data: nodeDefs} = await API({serverUrl}).get({
    path: `api/survey/${surveyId}/nodeDefs`,
  });
  return nodeDefs;
};

/*const getCategories = async ({serverUrl, surveyId}) => {
  const {data: categories} = await API({serverUrl}).get({
    path: `api/survey/${surveyId}/categories`,
  });
  return categories;
};

const getCategoryItems = async ({serverUrl, surveyId, categoryUuid}) => {
  const {data: categoryItems} = await API({serverUrl}).get({
    path: `api/survey/${surveyId}/categories/${categoryUuid}/items`,
  });
  return categoryItems;
};

const getCategoriesWithItems = async ({serverUrl, surveyId}) => {
  const categories = await getCategories({serverUrl, surveyId});
  const categoriesUuid = (categories?.list || []).map(({uuid}) => uuid);
  const categoriesItems = await Promise.all(
    categoriesUuid.map(async categoryUuid =>
      getCategoryItems({serverUrl, surveyId, categoryUuid}),
    ),
  );

  const {data: nodeDefsData} = await API({serverUrl}).get({
    path: `api/survey/${surveyId}/categories`,
  });
  return nodeDefsData;
};*/

const getSurveyPopulatedById = async ({serverUrl, surveyId}) => {
  const {survey} = await getSurveyById({serverUrl, surveyId});
  const nodeDefs = await getNodeDefs({serverUrl, surveyId});

  //const categories = await getCategoriesWithItems({serverUrl, surveyId});

  return {
    ...survey,
    nodeDefs,
  };
};

const surveysApi = {
  getSurveys,
  getSurveyById,
  getSurveyPopulatedById,
};

export default surveysApi;
