import { DatabaseSync, SQLInputValue } from "node:sqlite";

import SQLiteClient, { DbMigration, SqlParams } from "../SQLiteClient";

// expo-sqlite binds undefined as null, node:sqlite rejects it
// booleans are bound as 0/1 by expo-sqlite: not used by the tested queries
const toParams = (params: SqlParams = []) =>
  params.map((param) => param ?? null) as SQLInputValue[];

// tests only: SQLiteClient backed by an in-memory node:sqlite database instead of expo-sqlite
export const createNodeSQLiteClient = (migrations: DbMigration[] = []) => {
  const db = new DatabaseSync(":memory:");
  const client = new SQLiteClient("test", migrations);
  client.privateDb = {
    runAsync: (sql: string, params?: SqlParams) => {
      const { lastInsertRowid, changes } = db
        .prepare(sql)
        .run(...toParams(params));
      return Promise.resolve({
        lastInsertRowId: Number(lastInsertRowid),
        changes,
      });
    },
    execAsync: (sql: string) => Promise.resolve(db.exec(sql)),
    getFirstAsync: (sql: string, params?: SqlParams) =>
      Promise.resolve(db.prepare(sql).get(...toParams(params)) ?? null),
    getAllAsync: (sql: string, params?: SqlParams) =>
      Promise.resolve(db.prepare(sql).all(...toParams(params))),
    withTransactionAsync: async (task: () => Promise<void>) => {
      db.exec("BEGIN");
      try {
        await task();
        db.exec("COMMIT");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
    // only the methods used by SQLiteClient
  } as unknown as SQLiteClient["privateDb"];
  return { client, db };
};
