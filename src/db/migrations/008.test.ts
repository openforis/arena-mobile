import { createNodeSQLiteClient } from "../testing/createNodeSQLiteClient";
import { migration_001_base } from "./001";
import { migration_002 } from "./002";
import { migration_003_position_track } from "./003";
import { migration_004_record_read_only } from "./004";
import { migration_005_record_date_modified_synced } from "./005";
import { migration_006_record_indexes } from "./006";
import { migration_007_record_fixed_for } from "./007";
import { migration_008_record_validation_counts } from "./008";

jest.mock("expo-sqlite", () => ({}));
jest.mock("utils", () => ({ log: { debug: jest.fn() } }));

const migrationsBefore = [
  migration_001_base,
  migration_002,
  migration_003_position_track,
  migration_004_record_read_only,
  migration_005_record_date_modified_synced,
  migration_006_record_indexes,
  migration_007_record_fixed_for,
];

const fieldValidation = (errors: number, warnings: number) => ({
  valid: errors + warnings === 0,
  errors: Array.from({ length: errors }, () => ({ key: "required" })),
  warnings: Array.from({ length: warnings }, () => ({ key: "custom" })),
});

const contentByUuid: Record<string, any> = {
  withCounts: {
    validation: { valid: false, counts: { errors: 3, warnings: 1 } },
  },
  withoutCounts: {
    validation: {
      valid: false,
      fields: {
        n1: fieldValidation(2, 0),
        n2: {
          valid: false,
          fields: { n3: fieldValidation(1, 2) },
        },
      },
    },
  },
  valid: { validation: { valid: true, counts: { errors: 0, warnings: 0 } } },
  withoutValidation: { nodes: {} },
  summary: {},
};

const fetchCounts = (db: any) =>
  Object.fromEntries(
    db
      .prepare(`SELECT uuid, errors_count, warnings_count FROM record`)
      .all()
      .map(({ uuid, errors_count, warnings_count }: any) => [
        uuid,
        [errors_count, warnings_count],
      ]),
  );

const createDbWithRecords = async (contents: [string, any][]) => {
  const { client, db } = createNodeSQLiteClient(migrationsBefore);
  await client.runMigrationsIfNecessary();
  db.prepare(
    `INSERT INTO survey (uuid, name, content, date_created, date_modified) VALUES ('s', 's', '{}', 'd', 'd')`,
  ).run();
  const insert = db.prepare(
    `INSERT INTO record (uuid, survey_id, content, date_created, date_modified) VALUES (?, 1, ?, 'd', 'd')`,
  );
  for (const [uuid, content] of contents) {
    insert.run(uuid, JSON.stringify(content));
  }
  client.migrations = [
    ...migrationsBefore,
    migration_008_record_validation_counts,
  ];
  await client.runMigrationsIfNecessary();
  return db;
};

describe("migration 008: record validation counts", () => {
  it("adds the columns and fills them from the stored validations", async () => {
    const db = await createDbWithRecords(Object.entries(contentByUuid));

    expect(fetchCounts(db)).toEqual({
      withCounts: [3, 1],
      withoutCounts: [3, 2],
      valid: [0, 0],
      withoutValidation: [null, null],
      summary: [null, null],
    });
    // the content is not changed
    const { content } = db
      .prepare(`SELECT content FROM record WHERE uuid = 'withoutCounts'`)
      .get() as any;
    expect(JSON.parse(content)).toEqual(contentByUuid.withoutCounts);
  });

  it("counts validations without counts in batches", async () => {
    const contents: [string, any][] = Array.from({ length: 250 }, (_, i) => [
      `r${i}`,
      {
        validation: { valid: false, fields: { n: fieldValidation(1, i % 2) } },
      },
    ]);
    const db = await createDbWithRecords(contents);

    const counts = fetchCounts(db);
    expect(Object.keys(counts)).toHaveLength(250);
    expect(counts.r0).toEqual([1, 0]);
    expect(counts.r249).toEqual([1, 1]);
  });
});
