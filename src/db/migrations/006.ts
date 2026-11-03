import SQLiteClient from "db/SQLiteClient";

// non-unique: existing devices may contain duplicate records
export const migration_006_record_indexes = async (dbClient: SQLiteClient) => {
  await dbClient.transaction(async () => {
    await dbClient.executeSql(
      `CREATE INDEX IF NOT EXISTS record_survey_uuid_idx ON record (survey_id, uuid);`,
    );
    await dbClient.executeSql(
      `CREATE INDEX IF NOT EXISTS record_survey_cycle_idx ON record (survey_id, cycle);`,
    );
  });
};
