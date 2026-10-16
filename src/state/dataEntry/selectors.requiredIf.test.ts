import {
  ArenaRecord,
  RecordFactory,
  RecordUpdater,
  Records,
  Survey,
  SurveyBuilder,
  SurveyObjectBuilders,
  Surveys,
  User,
  UserFactory,
} from "@openforis/arena-core";

import { DataEntrySelectors } from "./selectors";

jest.mock("model", () => ({ RecordUtils: {}, SurveyDefs: {} }));
jest.mock("../survey/selectors", () => ({ SurveySelectors: {} }));

const { entityDef, integerDef, textDef } = SurveyObjectBuilders;

const user: User = UserFactory.createInstance({
  email: "test@openforis-arena.org",
  name: "test",
});

const toState = (record: ArenaRecord) => ({ dataEntry: { record } });

describe("DataEntrySelectors - required", () => {
  let survey: Survey;

  beforeAll(async () => {
    survey = await new SurveyBuilder(
      user,
      entityDef(
        "cluster",
        integerDef("cluster_id").key(),
        integerDef("land_use"),
        textDef("remarks").requiredIf("land_use == 1"),
        textDef("notes").required(),
        textDef("comment"),
      ),
    ).build();
  });

  const createRecord = async (): Promise<ArenaRecord> => {
    const record = RecordFactory.createInstance({
      surveyUuid: survey.uuid,
      user,
    });
    return (await RecordUpdater.createRootEntity({ user, survey, record }))
      .record;
  };

  const updateValue = async (
    record: ArenaRecord,
    name: string,
    value: any,
  ): Promise<ArenaRecord> => {
    const nodeDef = Surveys.getNodeDefByName({ survey, name });
    const node = Records.getChildren(
      Records.getRoot(record)!,
      nodeDef.uuid,
    )(record)[0]!;
    return (
      await RecordUpdater.updateAttributeValue({
        user,
        survey,
        record,
        attributeUuid: node.uuid,
        value,
      })
    ).record;
  };

  const isRequired = (record: ArenaRecord, name: string): boolean => {
    const nodeDef = Surveys.getNodeDefByName({ survey, name });
    const root = Records.getRoot(record)!;
    return DataEntrySelectors.selectRecordNodePointerRequired({
      parentNodeUuid: root.uuid,
      nodeDef,
    })(toState(record));
  };

  it("always required and not required attributes", async () => {
    const record = await createRecord();
    expect(isRequired(record, "notes")).toBe(true);
    expect(isRequired(record, "comment")).toBe(false);
  });

  it("required if attribute follows its condition", async () => {
    let record = await createRecord();
    expect(isRequired(record, "remarks")).toBe(false);

    record = await updateValue(record, "land_use", 1);
    expect(isRequired(record, "remarks")).toBe(true);

    record = await updateValue(record, "land_use", 2);
    expect(isRequired(record, "remarks")).toBe(false);
  });
});
