import {
  RecordBuilder,
  RecordNodeBuilders,
  Survey,
  SurveyBuilder,
  SurveyObjectBuilders,
  Surveys,
  UserFactory,
} from "@openforis/arena-core";

import { SurveyDefs } from "model";

import type { RootState } from "../store";
import { DataEntrySelectors } from "./selectors";

jest.mock("utils/PreviewMode", () => ({ PreviewMode: { isActive: false } }));
jest.mock("model", () => ({
  RecordUtils: {},
  SurveyDefs: {
    getChildrenDefs: jest.fn(({ survey, nodeDef }) =>
      require("@openforis/arena-core").Surveys.getNodeDefChildren({
        survey,
        nodeDef,
      }),
    ),
  },
}));
jest.mock("service", () => ({ SurveyService: {} }));
jest.mock("localization", () => ({}));

const { entityDef, integerDef, textDef } = SurveyObjectBuilders;
const { entity, attribute } = RecordNodeBuilders;

const user = UserFactory.createInstance({
  email: "test@openforis-arena.org",
  name: "test",
});

const createState = ({
  survey,
  record,
  activeChildDefIndex = 0,
}: any): RootState =>
  ({
    survey: { currentSurvey: survey },
    dataEntry: { record, recordCurrentPageEntity: null, activeChildDefIndex },
  }) as unknown as RootState;

describe("current page entity selectors", () => {
  let survey: Survey;
  let record: any;

  beforeAll(async () => {
    survey = await new SurveyBuilder(
      user,
      entityDef("cluster", integerDef("cluster_id").key(), textDef("remarks")),
    ).build();
    record = new RecordBuilder(
      user,
      survey,
      entity("cluster", attribute("cluster_id", 1), attribute("remarks", "a")),
    ).build();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("relevant child defs are computed once for the same record and page", () => {
    const state = createState({ survey, record });
    const childDefs1 =
      DataEntrySelectors.selectCurrentPageEntityRelevantChildDefs(state);
    // e.g. another slice changed: same survey, record and page
    const childDefs2 =
      DataEntrySelectors.selectCurrentPageEntityRelevantChildDefs({
        ...state,
      } as RootState);

    expect(childDefs1.map((def) => def.props.name)).toEqual([
      "cluster_id",
      "remarks",
    ]);
    expect(childDefs2).toBe(childDefs1);
    expect(SurveyDefs.getChildrenDefs).toHaveBeenCalledTimes(1);
  });

  test("child defs of the survey are cached across records", () => {
    const recordUpdated = { ...record };
    DataEntrySelectors.selectCurrentPageEntityRelevantChildDefs(
      createState({ survey, record }),
    );
    DataEntrySelectors.selectCurrentPageEntityRelevantChildDefs(
      createState({ survey, record: recordUpdated }),
    );
    expect(SurveyDefs.getChildrenDefs).not.toHaveBeenCalled();
  });

  test("active child is the child def at the active index", () => {
    const remarksDef = Surveys.getNodeDefByName({ survey, name: "remarks" });
    const state = createState({ survey, record, activeChildDefIndex: 1 });
    expect(
      DataEntrySelectors.selectCurrentPageEntityRelevantChildDefs(state)[1],
    ).toBe(remarksDef);
  });
});
