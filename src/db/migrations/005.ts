import SQLiteClient from "db/SQLiteClient";

// date_modified at the last sync: compared only with local dates, so clock differences don't matter
export const migration_005_record_date_modified_synced = async (
  dbClient: SQLiteClient,
) => {
  await dbClient.transaction(async () => {
    await dbClient.executeSql(
      `ALTER TABLE record ADD COLUMN date_modified_synced TIMESTAMP;`,
    );
  });
};
