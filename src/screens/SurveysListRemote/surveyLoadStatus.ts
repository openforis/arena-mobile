import { Dates } from "@openforis/arena-core";

export const getSurveyLoadStatusKey = ({
  survey,
  localSurvey,
}: {
  survey: { datePublished?: any };
  localSurvey?: { datePublished?: any } | null;
}): string => {
  if (!localSurvey) {
    return "surveys:loadStatus.notInDevice";
  }
  if (Dates.isAfter(survey.datePublished, localSurvey.datePublished)) {
    return "surveys:loadStatus.updated";
  }
  return "surveys:loadStatus.upToDate";
};
