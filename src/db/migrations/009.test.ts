import { createNodeSQLiteClient } from "../testing/createNodeSQLiteClient";
import { dbMigrations } from "../initialize";
import { migration_009_survey_description } from "./009";

jest.mock("utils", () => ({ log: { debug: jest.fn() } }));

describe("migration 009: survey description", () => {
  it("adds the description column, empty for the existing surveys", async () => {
    const migrationsBefore = dbMigrations.slice(0, 8);
    const { client, db } = createNodeSQLiteClient(migrationsBefore);
    await client.runMigrationsIfNecessary();
    db.prepare(
      `INSERT INTO survey (uuid, name, content, date_created, date_modified) VALUES ('s', 's', '', 'd', 'd')`,
    ).run();

    client.migrations = [...migrationsBefore, migration_009_survey_description];
    const { prevDbVersion } = await client.runMigrationsIfNecessary();

    expect(prevDbVersion).toBe(8);
    expect(db.prepare(`SELECT uuid, description FROM survey`).all()).toEqual([
      { uuid: "s", description: null },
    ]);
  });
});
