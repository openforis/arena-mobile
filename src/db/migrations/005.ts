import SQLiteClient from "db/SQLiteClient";

// the record's own date_modified at the last sync: compared with date_modified on this device
// only, so the difference between the device and the server clocks doesn't matter
export const migration_005_record_date_modified_synced = async (
  dbClient: SQLiteClient,
) => {
  await dbClient.transaction(async () => {
    await dbClient.executeSql(
      `ALTER TABLE record ADD COLUMN date_modified_synced TIMESTAMP;`,
    );
  });
};
