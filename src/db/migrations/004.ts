import SQLiteClient from "db/SQLiteClient";

// records of other user groups the user can only read (see UserGroup readableGroupUuids in Arena)
export const migration_004_record_read_only = async (
  dbClient: SQLiteClient,
) => {
  await dbClient.transaction(async () => {
    await dbClient.executeSql(
      `ALTER TABLE record ADD COLUMN read_only INTEGER NOT NULL DEFAULT 0;`,
    );
  });
};
