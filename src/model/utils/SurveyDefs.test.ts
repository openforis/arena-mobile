import {
  NodeDefEntity,
  NodeDefs,
  Survey,
  Surveys,
} from "@openforis/arena-core";

import demoSurveyJson from "../../service/demoSurvey.json";

import { SurveyDefs } from "./SurveyDefs";

const cycle = "0";

describe("SurveyDefs.getEntitySummaryDefs", () => {
  test("doesn't duplicate key defs also included in the multiple entity summary", () => {
    const survey = JSON.parse(JSON.stringify(demoSurveyJson)) as Survey;
    const keyDef = Surveys.getNodeDefByName({
      survey,
      name: "regeneration_no",
    }) as any;
    keyDef.props.layout = {
      [cycle]: { includedInMultipleEntitySummary: true },
    };
    const entityDef = Surveys.getNodeDefByName({
      survey,
      name: "regeneration",
    }) as NodeDefEntity;

    const summaryDefNames = SurveyDefs.getEntitySummaryDefs({
      survey,
      entityDef,
      cycle,
      onlyKeys: false,
    }).map(NodeDefs.getName);

    expect(summaryDefNames).toEqual([
      "regeneration_no",
      "regeneration_species",
      "regeneration_count",
    ]);
  });
});
