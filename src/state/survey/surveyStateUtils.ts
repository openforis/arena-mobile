import { Surveys } from "@openforis/arena-core";

import { i18n } from "localization";

export const determinePreferredSurveyLanguage = (survey) => {
  if (!survey) return null;
  const lang = i18n.language;
  const surveyLanguages = Surveys.getLanguages(survey);
  return surveyLanguages.includes(lang) ? lang : surveyLanguages[0];
};
