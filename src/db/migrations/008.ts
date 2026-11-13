import { Validations } from "@openforis/arena-core";

import SQLiteClient from "db/SQLiteClient";

const backfillBatchSize = 100;

// validation counts stored in columns: lists read them without parsing the record content
export const migration_008_record_validation_counts = async (
  dbClient: SQLiteClient,
) => {
  await dbClient.transaction(async (tx) => {
    await tx.executeSql(
      `ALTER TABLE record ADD COLUMN errors_count INTEGER;
      ALTER TABLE record ADD COLUMN warnings_count INTEGER;`,
    );
    await tx.runSql(
      `UPDATE record SET
        errors_count = COALESCE(json_extract(content, '$.validation.counts.errors'), 0),
        warnings_count = COALESCE(json_extract(content, '$.validation.counts.warnings'), 0)
      WHERE json_valid(content) AND json_type(content, '$.validation.counts') = 'object'`,
    );
    // validations stored without counts: counted here
    let rows: any[];
    do {
      rows = await tx.many(
        `SELECT id, json_extract(content, '$.validation') AS validation
        FROM record
        WHERE errors_count IS NULL AND json_valid(content)
          AND json_type(content, '$.validation') = 'object'
        LIMIT ${backfillBatchSize}`,
      );
      for (const { id, validation } of rows) {
        const counts = Validations.calculateCounts(JSON.parse(validation));
        await tx.runSql(
          `UPDATE record SET errors_count = ?, warnings_count = ? WHERE id = ?`,
          [counts.errors, counts.warnings, id],
        );
      }
    } while (rows.length === backfillBatchSize);
  });
};
