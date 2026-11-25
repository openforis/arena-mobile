import { SurveyDependencyType } from "@openforis/arena-core";
import type { ArenaSurvey } from "@openforis/arena-core";

import { SurveyDependencyGraphs } from "./SurveyDependencyGraphs";

const surveyWithGraph = (dependencyGraph: object | undefined) =>
  ({ dependencyGraph }) as unknown as ArenaSurvey;

describe("SurveyDependencyGraphs.isOutdated", () => {
  test("missing graph or dependency types: outdated", () => {
    expect(SurveyDependencyGraphs.isOutdated(surveyWithGraph(undefined))).toBe(
      true,
    );
    expect(
      SurveyDependencyGraphs.isOutdated(
        surveyWithGraph({ [SurveyDependencyType.defaultValues]: {} }),
      ),
    ).toBe(true);
  });

  test("graph with all the dependency types: not outdated", () => {
    expect(
      SurveyDependencyGraphs.isOutdated(
        surveyWithGraph({
          [SurveyDependencyType.appInfo]: {},
          [SurveyDependencyType.nodeDates]: {},
        }),
      ),
    ).toBe(false);
  });
});
