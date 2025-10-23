import { Surveys } from "@openforis/arena-core";

import { i18n } from "localization";

export const determinePreferredSurveyLanguage = (survey: any) => {
  if (!survey) return null;
  const lang = i18n.language;
  const surveyLanguages = Surveys.getLanguages(survey);
  // @ts-expect-error TS(2345): Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
  return surveyLanguages.includes(lang) ? lang : surveyLanguages[0];
};
