import SQLiteClient from "./SQLiteClient";
import { migration_001_base } from "./migrations/001";
import { migration_002 } from "./migrations/002";
import { migration_003_position_track } from "./migrations/003";
import { migration_004_record_read_only } from "./migrations/004";
import { migration_005_record_date_modified_synced } from "./migrations/005";

const dbName = "arena_mobile.db";
const debug = true;
const dbMigrations: ((client: SQLiteClient) => Promise<void>)[] = [
  migration_001_base,
  migration_002,
  migration_003_position_track,
  migration_004_record_read_only,
  migration_005_record_date_modified_synced,
];

/** Application's SQLite client */
export const dbClient = new SQLiteClient(dbName, dbMigrations, debug);

/** Applicaiton initialization. */
export const initialize = async () => dbClient.connect();
