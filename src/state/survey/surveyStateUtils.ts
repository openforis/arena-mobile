import { Surveys } from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'localization' or its correspon... Remove this comment to see the full error message
import { i18n } from "localization";

export const determinePreferredSurveyLanguage = (survey: any) => {
  if (!survey) return null;
  const lang = i18n.language;
  const surveyLanguages = Surveys.getLanguages(survey);
  return surveyLanguages.includes(lang) ? lang : surveyLanguages[0];
};
