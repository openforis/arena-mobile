// jest.mock factories shared by the repository tests that run on a real (node) SQLite database;
// use them as: jest.mock("db", () => jest.requireActual("service/repository/testing/repositoryTestMocks").dbMock())

export const utilsMock = () => ({
  log: { debug: jest.fn(), warn: jest.fn() },
  SystemUtils: { getRecordAppInfo: () => ({ version: "2.12.0" }) },
});

export const modelMock = () => ({
  ...jest.requireActual("model/RecordLoadStatus"),
  ...jest.requireActual("model/RecordOrigin"),
  ...jest.requireActual("model/utils/RecordSummaries"),
  ...jest.requireActual("model/utils/SurveyDefs"),
});

export const dbMock = () => {
  const { dbMigrations } = jest.requireActual("db/initialize");
  const { createNodeSQLiteClient } = jest.requireActual(
    "db/testing/createNodeSQLiteClient",
  );
  const { DbUtils } = jest.requireActual("db/dbUtils");
  return { dbClient: createNodeSQLiteClient(dbMigrations).client, DbUtils };
};
