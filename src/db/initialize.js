import SQLiteClient from "./SQLiteClient";
import { migration_001_base } from "./migrations/001";

const dbName = "arena_mobile.db";
const debug = true;
const dbMigrations = [migration_001_base];

/** Application's SQLite client */
export const dbClient = new SQLiteClient(dbName, dbMigrations, debug);

/** Applicaiton initialization. */
export const initialize = async () => dbClient.connect();
