import SQLiteClient from "db/SQLiteClient";

// survey and app versions the record content was last fixed for (see RecordRepository.fetchRecord)
export const migration_007_record_fixed_for = async (
  dbClient: SQLiteClient,
) => {
  await dbClient.transaction(async () => {
    await dbClient.executeSql(`ALTER TABLE record ADD COLUMN fixed_for TEXT;`);
  });
};
