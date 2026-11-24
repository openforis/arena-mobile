import { Dates } from "@openforis/arena-core";

export const getSurveyLoadStatusKey = ({
  survey,
  localSurvey,
}: {
  survey: { datePublished?: string };
  localSurvey?: { datePublished?: string; dateModified?: string } | null;
}): string => {
  if (!localSurvey) {
    return "surveys:loadStatus.notInDevice";
  }
  if (Dates.isAfter(survey.datePublished!, localSurvey.datePublished!)) {
    return "surveys:loadStatus.updated";
  }
  return "surveys:loadStatus.upToDate";
};
