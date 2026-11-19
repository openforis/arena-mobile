import { Dates, ArenaSurvey } from "@openforis/arena-core";

const hasUpdates = ({
  localSurvey,
  remoteSurvey,
}: {
  localSurvey: ArenaSurvey;
  remoteSurvey: ArenaSurvey;
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
