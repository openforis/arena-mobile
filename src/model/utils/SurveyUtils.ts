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

// survey setting (default false): when false, values of attributes becoming non-applicable are cleared
// (keepNonApplicableValues is not in arena-core SurveyProps yet)
const isKeepNonApplicableValues = (survey: Survey): boolean =>
  (survey.props as { keepNonApplicableValues?: boolean })
    .keepNonApplicableValues === true;

export const SurveyUtils = {
  hasUpdates,
  isKeepNonApplicableValues,
};
