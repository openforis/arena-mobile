import {
  ArenaRecord,
  ArenaSurvey,
  Records,
  RecordBuilder,
  RecordNodeBuilders,
  SurveyBuilder,
  SurveyObjectBuilders,
  ArenaUser,
  UserFactory,
  ArenaUserGroup,
} from "@openforis/arena-core";

import { UserGroupQualifiers } from "./UserGroupQualifiers";

const { entityDef, integerDef, textDef } = SurveyObjectBuilders;
const { entity, attribute } = RecordNodeBuilders;

const user: ArenaUser = UserFactory.createInstance({
  email: "test@openforis-arena.org",
  name: "test",
});

const buildSurvey = () =>
  new SurveyBuilder(
    user,
    entityDef(
      "plot",
      integerDef("plot_id").key(),
      textDef("team").qualifier(),
      textDef("notes"),
    ),
  ).build();

const buildUserGroup = (teamValue: string): ArenaUserGroup => ({
  uuid: "group-uuid",
  props: {
    name: "control",
    qualifiers: [{ name: "team", value: teamValue }],
  },
});

const getAttributeValue = (
  record: ArenaRecord,
  name: string,
  survey: ArenaSurvey,
) => {
  const nodeDef = Object.values(survey.nodeDefs ?? {}).find(
    (def) => def.props.name === name,
  )!;
  return Records.getNodesByDefUuid(nodeDef.uuid)(record)[0]?.value;
};

describe("UserGroupQualifiers.assignQualifierValues", () => {
  test("overwrites the qualifier values with the ones of the user group", async () => {
    const survey = await buildSurvey();
    const record = new RecordBuilder(
      user,
      survey,
      entity(
        "plot",
        attribute("plot_id", 1),
        attribute("team", "contractor_a"),
        attribute("notes", "some notes"),
      ),
    ).build();

    const { record: recordUpdated } =
      await UserGroupQualifiers.assignQualifierValues({
        user,
        survey,
        userGroup: buildUserGroup("control"),
        record,
      });

    expect(getAttributeValue(recordUpdated, "team", survey)).toBe("control");
    expect(getAttributeValue(recordUpdated, "notes", survey)).toBe(
      "some notes",
    );
  });

  test("keeps the record unchanged when the user has no group", async () => {
    const survey = await buildSurvey();
    const record = new RecordBuilder(
      user,
      survey,
      entity(
        "plot",
        attribute("plot_id", 1),
        attribute("team", "contractor_a"),
      ),
    ).build();

    const { record: recordUpdated } =
      await UserGroupQualifiers.assignQualifierValues({
        user,
        survey,
        userGroup: null,
        record,
      });

    expect(getAttributeValue(recordUpdated, "team", survey)).toBe(
      "contractor_a",
    );
  });
});
