import { Dates, ArenaSurvey } from "@openforis/arena-core";

type SurveyLastUpdateDates = Pick<
  ArenaSurvey,
  "datePublished" | "dateModified"
>;

const hasUpdates = ({
  localSurvey,
  remoteSurvey,
}: {
  localSurvey: SurveyLastUpdateDates;
  remoteSurvey: SurveyLastUpdateDates;
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
