import { Dates } from "@openforis/arena-core";

import { SurveySummaryLocal } from "model";

export const getSurveyLoadStatusKey = ({
  survey,
  localSurvey,
}: {
  survey: { datePublished?: string };
  // dateModified of a local survey stores the date it was published in the server
  localSurvey?: Pick<SurveySummaryLocal, "dateModified"> | null;
}): string => {
  if (!localSurvey) {
    return "surveys:loadStatus.notInDevice";
  }
  const { datePublished } = survey;
  if (datePublished && Dates.isAfter(datePublished, localSurvey.dateModified)) {
    return "surveys:loadStatus.updated";
  }
  return "surveys:loadStatus.upToDate";
};
