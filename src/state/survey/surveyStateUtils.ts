import { LanguageCode, Surveys } from "@openforis/arena-core";

import { i18n } from "localization";

export const determinePreferredSurveyLanguage = (survey: any) => {
  if (!survey) return null;
  const lang = i18n.language as LanguageCode;
  const surveyLanguages = Surveys.getLanguages(survey);
  return surveyLanguages.includes(lang) ? lang : surveyLanguages[0];
};
