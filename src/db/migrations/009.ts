import SQLiteClient from "db/SQLiteClient";

// survey content is stored in the file system: existing rows are filled by DataMigrationService
export const migration_009_survey_description = async (
  dbClient: SQLiteClient,
) => {
  await dbClient.transaction(async () => {
    await dbClient.executeSql(
      `ALTER TABLE survey ADD COLUMN description TEXT;`,
    );
  });
};
