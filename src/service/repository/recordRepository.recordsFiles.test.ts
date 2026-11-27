import {
  ArenaRecord,
  ArenaSurvey,
  RecordBuilder,
  RecordNodeBuilders,
  SurveyBuilder,
  SurveyObjectBuilders,
  UserFactory,
} from "@openforis/arena-core";

import { dbClient } from "db";

import { RecordRepository } from "./recordRepository";

jest.mock("utils", () =>
  jest
    .requireActual("service/repository/testing/repositoryTestMocks")
    .utilsMock(),
);
jest.mock("model", () =>
  jest
    .requireActual("service/repository/testing/repositoryTestMocks")
    .modelMock(),
);
jest.mock("db", () =>
  jest.requireActual("service/repository/testing/repositoryTestMocks").dbMock(),
);

const { entityDef, integerDef } = SurveyObjectBuilders;
const { entity, attribute } = RecordNodeBuilders;

const user = UserFactory.createInstance({ email: "t@t.org", name: "t" });

let survey: ArenaSurvey;

const buildRecordWithFiles = (
  plotId: number,
  files: { fileUuid: string; fileSize?: number }[],
): ArenaRecord => {
  const record = new RecordBuilder(
    user,
    survey,
    entity("plot", attribute("plot_id", plotId)),
  ).build();
  for (const [index, value] of files.entries()) {
    const uuid = `${record.uuid}-file-${index}`;
    record.nodes![uuid] = {
      uuid,
      nodeDefUuid: "file-def",
      recordUuid: record.uuid,
      value,
    } as NonNullable<ArenaRecord["nodes"]>[string];
  }
  return record;
};

describe("fetchRecordsFiles", () => {
  beforeAll(async () => {
    await dbClient.runMigrationsIfNecessary();
    await dbClient.runSql(
      `INSERT INTO survey (uuid, name, content, date_created, date_modified) VALUES ('s', 's', '{}', 'd', 'd')`,
    );
    survey = {
      ...(await new SurveyBuilder(
        user,
        entityDef("plot", integerDef("plot_id").key()),
      ).build()),
      id: 1,
    };
  });

  test("returns the files of the given records only, with their size", async () => {
    const record1 = buildRecordWithFiles(1, [
      { fileUuid: "f1", fileSize: 100 },
      { fileUuid: "f2" },
    ]);
    const record2 = buildRecordWithFiles(2, [
      { fileUuid: "f3", fileSize: 300 },
    ]);
    const record3 = buildRecordWithFiles(3, [{ fileUuid: "f4", fileSize: 1 }]);
    for (const record of [record1, record2, record3]) {
      await RecordRepository.insertRecord({ survey, record });
    }

    const files = await RecordRepository.fetchRecordsFiles({
      surveyId: survey.id,
      recordUuids: [record1.uuid, record2.uuid],
    });

    const byFileUuid = (a: { fileUuid: string }, b: { fileUuid: string }) =>
      a.fileUuid.localeCompare(b.fileUuid);
    expect(files.sort(byFileUuid)).toEqual([
      { recordUuid: record1.uuid, fileUuid: "f1", fileSize: 100 },
      { recordUuid: record1.uuid, fileUuid: "f2", fileSize: null },
      { recordUuid: record2.uuid, fileUuid: "f3", fileSize: 300 },
    ]);
  });

  test("returns no files when no records are given", async () => {
    expect(
      await RecordRepository.fetchRecordsFiles({
        surveyId: survey.id,
        recordUuids: [],
      }),
    ).toEqual([]);
  });
});
