import {
  RecordFactory,
  RecordUpdater,
  SurveyBuilder,
  SurveyObjectBuilders,
  UserFactory,
} from "@openforis/arena-core";

import type { RootState } from "../store";
import { RemoteConnectionSelectors } from "./selectors";

// survey selectors dependencies (native modules)
jest.mock("model", () => ({}));
jest.mock("service", () => ({ SurveyService: {} }));
jest.mock("localization", () => ({}));

const { entityDef, integerDef, textDef } = SurveyObjectBuilders;

describe("selectLoggedUserSafe", () => {
  test("not logged in: expressions using userProp can be evaluated", async () => {
    const surveyCreator = UserFactory.createInstance({
      email: "test@openforis.org",
      name: "test",
    });
    const survey = await new SurveyBuilder(
      surveyCreator,
      entityDef(
        "cluster",
        integerDef("cluster_id").key(),
        textDef("team_note").applyIf("userProp('team') == 'A'"),
      ),
    ).build();

    const user = RemoteConnectionSelectors.selectLoggedUserSafe({
      remoteConnection: { user: null },
    } as unknown as RootState);
    const record = RecordFactory.createInstance({
      surveyUuid: survey.uuid,
      user,
    });
    const { record: recordUpdated } = await RecordUpdater.createRootEntity({
      user,
      survey,
      record,
    });
    expect(Object.keys(recordUpdated.nodes ?? {}).length).toBeGreaterThan(0);
  });
});

const surveyUuid = "survey-1";
const survey = { uuid: surveyUuid, published: true, props: {} };

const userWithGroup = (name: string, groupSurveyUuid = surveyUuid) => ({
  uuid: "user-1",
  props: {},
  authGroups: [
    {
      name,
      surveyUuid: groupSurveyUuid,
      permissions: [],
      recordSteps: {},
    },
  ],
});

const createState = (user: any) =>
  ({
    survey: { currentSurvey: survey },
    remoteConnection: { user },
  }) as unknown as RootState;

const { selectLoggedUserCanCreateRecords } = RemoteConnectionSelectors;

describe("selectLoggedUserCanCreateRecords", () => {
  test("not logged in: records can be created (offline)", () => {
    expect(selectLoggedUserCanCreateRecords(createState(null))).toBe(true);
  });

  test("data editor can create records", () => {
    expect(
      selectLoggedUserCanCreateRecords(
        createState(userWithGroup("dataEditor")),
      ),
    ).toBe(true);
  });

  test("survey guest cannot create records", () => {
    expect(
      selectLoggedUserCanCreateRecords(
        createState(userWithGroup("surveyGuest")),
      ),
    ).toBe(false);
  });

  test("survey guest of another survey: no role in this survey", () => {
    expect(
      selectLoggedUserCanCreateRecords(
        createState(userWithGroup("surveyGuest", "survey-2")),
      ),
    ).toBe(true);
  });
});
