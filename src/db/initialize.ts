import SQLiteClient from "./SQLiteClient";
import { migration_001_base } from "./migrations/001";
import { migration_002 } from "./migrations/002";

const dbName = "arena_mobile.db";
const debug = true;
const dbMigrations: ((client: SQLiteClient) => Promise<void>)[] = [
  migration_001_base,
  migration_002,
];

/** Application's SQLite client */
export const dbClient = new SQLiteClient(dbName, dbMigrations, debug);

/** Applicaiton initialization. */
export const initialize = async () => dbClient.connect();
