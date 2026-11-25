import {
  ArenaSurvey,
  SurveyDependencyType,
  Surveys,
} from "@openforis/arena-core";

// graphs built with a previous arena-core version lack the dependency types added later
const requiredDependencyTypes = [
  SurveyDependencyType.appInfo,
  SurveyDependencyType.nodeDates,
];

const isOutdated = (survey: ArenaSurvey): boolean =>
  requiredDependencyTypes.some((type) => !survey.dependencyGraph?.[type]);

const rebuildIfOutdated = (survey: ArenaSurvey): Promise<ArenaSurvey> =>
  isOutdated(survey)
    ? Surveys.buildAndAssocDependencyGraph(survey)
    : Promise.resolve(survey);

export const SurveyDependencyGraphs = {
  isOutdated,
  rebuildIfOutdated,
};
