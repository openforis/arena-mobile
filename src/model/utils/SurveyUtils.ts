import { Dates, Survey } from "@openforis/arena-core";

const hasUpdates = ({
  localSurvey,
  remoteSurvey,
}: {
  localSurvey: Survey;
  remoteSurvey: Survey;
}) => {
  const remoteSurveyLastUpdate =
    remoteSurvey.datePublished ?? remoteSurvey.dateModified;

  const localSurveyLastUpdate =
    localSurvey.datePublished ?? localSurvey.dateModified;

  return Dates.isAfter(remoteSurveyLastUpdate!, localSurveyLastUpdate!);
};

export const SurveyUtils = {
  hasUpdates,
};
