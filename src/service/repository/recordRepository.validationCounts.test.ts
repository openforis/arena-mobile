import {
  RecordBuilder,
  RecordNodeBuilders,
  SurveyBuilder,
  SurveyObjectBuilders,
  UserFactory,
} from "@openforis/arena-core";

import { dbClient } from "db";

import { RecordRepository } from "./recordRepository";

jest.mock("expo-sqlite", () => ({}));
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

const validationWithoutCounts = {
  valid: false,
  fields: {
    n1: { valid: false, errors: [{ key: "required" }, { key: "required" }] },
    n2: { valid: false, warnings: [{ key: "custom" }] },
  },
};

let survey: any;

const buildRecord = (validation: any) => {
  const record: any = new RecordBuilder(
    user,
    survey,
    entity("plot", attribute("plot_id", 1)),
  ).build();
  record.validation = validation;
  return record;
};

const fetchSummary = async (uuid: string) => {
  const records = await RecordRepository.fetchRecords({
    survey,
    onlyLocal: false,
  });
  return records.find((record) => record.uuid === uuid)!;
};

describe("record validation counts columns", () => {
  beforeAll(async () => {
    await dbClient.runMigrationsIfNecessary();
    await dbClient.runSql(
      `INSERT INTO survey (uuid, name, content, date_created, date_modified) VALUES ('s', 's', '{}', 'd', 'd')`,
    );
    survey = await new SurveyBuilder(
      user,
      entityDef("plot", integerDef("plot_id").key()),
    ).build();
    survey.id = 1;
  });

  test("summaries get the counts of the inserted record validation", async () => {
    const record = buildRecord(validationWithoutCounts);
    await RecordRepository.insertRecord({ survey, record });

    const summary: any = await fetchSummary(record.uuid);
    expect(summary.validation).toEqual({
      valid: false,
      counts: { errors: 2, warnings: 1 },
    });
    expect(summary.errorsCount).toBeUndefined();
  });

  test("the full record keeps the whole validation", async () => {
    const record = buildRecord(validationWithoutCounts);
    const { id: recordId } = await RecordRepository.insertRecord({
      survey,
      record,
    });

    const recordFetched = await RecordRepository.fetchRecord({
      survey,
      recordId,
    });
    expect(recordFetched.validation).toEqual({
      ...validationWithoutCounts,
      counts: { errors: 2, warnings: 1 },
    });
  });

  test("storing the fixed record content updates the counts", async () => {
    const record = buildRecord(validationWithoutCounts);
    const { id: recordId } = await RecordRepository.insertRecord({
      survey,
      record,
    });
    // the counts get out of sync, the fixed content puts them back
    await dbClient.runSql(`UPDATE record SET errors_count = 0 WHERE id = ?`, [
      recordId,
    ]);

    await RecordRepository.fetchRecord({
      survey: { ...survey, datePublished: "2026-11-01T10:00:00.000Z" },
      recordId,
    });
    const row: any = await dbClient.one(
      `SELECT fixed_for, errors_count, warnings_count FROM record WHERE id = ?`,
      [recordId],
    );
    expect(row.fixed_for).not.toBeNull();
    expect([row.errors_count, row.warnings_count]).toEqual([2, 1]);
  });

  test("updating the record or its validation updates the counts", async () => {
    const record = buildRecord(validationWithoutCounts);
    await RecordRepository.insertRecord({ survey, record });

    await RecordRepository.updateRecord({
      survey,
      record: { ...record, validation: { valid: true } },
    });
    expect((await fetchSummary(record.uuid)).validation).toEqual({
      valid: true,
      counts: { errors: 0, warnings: 0 },
    });

    await RecordRepository.updateRecordValidation({
      surveyId: survey.id,
      recordUuid: record.uuid,
      validation: {
        valid: false,
        fields: { n1: { valid: false, errors: [{ key: "required" }] } },
        counts: { errors: 1, warnings: 0 },
      },
    });
    expect((await fetchSummary(record.uuid)).validation).toEqual({
      valid: false,
      counts: { errors: 1, warnings: 0 },
    });
  });

  test("remote summaries without content have no validation", async () => {
    const [id] = await RecordRepository.insertRecordSummaries({
      survey,
      cycle: "0",
      recordSummaries: [
        { uuid: "remote-1", dateCreated: Date.now(), dateModified: Date.now() },
      ],
    });

    const summary = await RecordRepository.fetchRecordSummary({
      survey,
      recordId: id,
    });
    expect(summary.validation).toBeNull();
  });
});
