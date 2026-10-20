import {
  RecordFactory,
  RecordUpdater,
  SurveyBuilder,
  SurveyObjectBuilders,
  UserFactory,
} from "@openforis/arena-core";

import { RemoteConnectionSelectors } from "./selectors";

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
    });
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
