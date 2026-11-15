import {
  RecordBuilder,
  RecordNodeBuilders,
  SurveyBuilder,
  SurveyObjectBuilders,
  UserFactory,
} from "@openforis/arena-core";

import { dbClient } from "db";

import { PositionTrackRepository } from "./positionTrackRepository";
import { RecordRepository } from "./recordRepository";
import { SurveyRepository } from "./surveyRepository";

jest.mock("utils", () => ({
  log: { debug: jest.fn(), warn: jest.fn() },
  SystemUtils: { getRecordAppInfo: () => ({ version: "2.12.0" }) },
}));
jest.mock("model", () => ({
  ...jest.requireActual("model/RecordLoadStatus"),
  ...jest.requireActual("model/RecordOrigin"),
  ...jest.requireActual("model/utils/RecordSummaries"),
  ...jest.requireActual("model/utils/SurveyDefs"),
}));
jest.mock("db", () => {
  const { dbMigrations } = jest.requireActual("db/initialize");
  const { createNodeSQLiteClient } = jest.requireActual(
    "db/testing/createNodeSQLiteClient",
  );
  const { DbUtils } = jest.requireActual("db/dbUtils");
  return { dbClient: createNodeSQLiteClient(dbMigrations).client, DbUtils };
});

const { entityDef, integerDef } = SurveyObjectBuilders;
const { entity, attribute } = RecordNodeBuilders;

const user = UserFactory.createInstance({ email: "t@t.org", name: "t" });

// a quote in a uuid must not break the IN list
const uuids = ["r1", "r2", "r'3"];

let survey: any;

const insertRecords = async (surveyId: number) => {
  for (const [index, uuid] of uuids.entries()) {
    const record: any = new RecordBuilder(
      user,
      survey,
      entity("plot", attribute("plot_id", index + 1)),
    ).build();
    record.uuid = uuid;
    await RecordRepository.insertRecord({
      survey: { ...survey, id: surveyId },
      record,
    });
  }
};

const countRows = async (table: string, where = "1 = 1", params: any[] = []) =>
  (
    (await dbClient.one(
      `SELECT COUNT(*) AS count FROM ${table} WHERE ${where}`,
      params,
    )) as any
  ).count;

describe("repositories IN lists", () => {
  beforeAll(async () => {
    await dbClient.runMigrationsIfNecessary();
    await dbClient.runSql(
      `INSERT INTO survey (uuid, name, content, date_created, date_modified) VALUES ('s1', 's1', '{}', 'd', 'd'), ('s2', 's2', '{}', 'd', 'd')`,
    );
    survey = await new SurveyBuilder(
      user,
      entityDef("plot", integerDef("plot_id").key()),
    ).build();
    survey.id = 1;
    await insertRecords(1);
    await insertRecords(2);
  });

  test("updateRecordsReadOnly updates only the given records", async () => {
    await RecordRepository.updateRecordsReadOnly({
      surveyId: 1,
      recordUuids: ["r2", "r'3"],
      readOnly: true,
    });
    const rows = await dbClient.many(
      `SELECT uuid FROM record WHERE survey_id = 1 AND read_only = 1 ORDER BY uuid`,
    );
    expect(rows.map((row: any) => row.uuid)).toEqual(["r'3", "r2"]);
    expect(await countRows("record", "survey_id = 2 AND read_only = 1")).toBe(
      0,
    );
  });

  test("updateRecordsDateSync updates only the given records", async () => {
    await RecordRepository.updateRecordsDateSync({
      surveyId: 1,
      recordUuids: ["r1"],
    });
    expect(await countRows("record", "date_synced IS NOT NULL")).toBe(1);
  });

  test("fetchRecordsDateModifiedByUuid", async () => {
    const result = await RecordRepository.fetchRecordsDateModifiedByUuid({
      surveyId: 1,
      recordUuids: ["r1", "r'3", "missing"],
    });
    expect(Object.keys(result).sort()).toEqual(["r'3", "r1"]);
    expect(
      await RecordRepository.fetchRecordsDateModifiedByUuid({
        surveyId: 1,
        recordUuids: [],
      }),
    ).toEqual({});
  });

  test("fetchRecordsFileUuids with an empty list of records", async () => {
    expect(
      await RecordRepository.fetchRecordsFileUuids({
        surveyId: 1,
        recordUuids: [],
      }),
    ).toEqual([]);
    expect(
      await RecordRepository.fetchRecordsFileUuids({
        surveyId: 1,
        recordUuids: ["r1"],
      }),
    ).toEqual([]);
  });

  test("deleteTracksByRecordUuids deletes tracks and their points", async () => {
    const trackIds: number[] = [];
    for (const recordUuid of uuids) {
      const { id } = await PositionTrackRepository.insertTrack({
        surveyId: 1,
        recordUuid,
        nodeUuid: "n",
        baseValue: null,
      });
      await PositionTrackRepository.insertPoint({
        trackId: id,
        segmentIndex: 0,
        point: { time: 1, latitude: 1, longitude: 1 } as any,
      });
      trackIds.push(id);
    }
    await PositionTrackRepository.deleteTracksByRecordUuids(["r1", "r'3"]);
    const rows = await dbClient.many(`SELECT record_uuid FROM position_track`);
    expect(rows.map((row: any) => row.record_uuid)).toEqual(["r2"]);
    expect(await countRows("position_track_point")).toBe(1);
    await PositionTrackRepository.deleteTracksByRecordUuids([]);
    expect(await countRows("position_track")).toBe(1);
  });

  test("deleteRecords deletes only the given records", async () => {
    await RecordRepository.deleteRecords({ surveyId: 1, recordUuids: ["r1"] });
    await RecordRepository.deleteRecords({ surveyId: 1, recordUuids: [] });
    expect(await countRows("record", "survey_id = 1")).toBe(2);
    expect(await countRows("record", "survey_id = 2")).toBe(3);
  });

  test("deleteSurveys deletes the surveys and their dependent rows", async () => {
    await SurveyRepository.deleteSurveys([]);
    await SurveyRepository.deleteSurveys([1]);
    expect(await countRows("survey")).toBe(1);
    expect(await countRows("record", "survey_id = 1")).toBe(0);
    expect(await countRows("record", "survey_id = 2")).toBe(3);
    expect(await countRows("position_track")).toBe(0);
    expect(await countRows("position_track_point")).toBe(0);
  });
});
