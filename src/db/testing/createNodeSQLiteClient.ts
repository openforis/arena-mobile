import { DatabaseSync } from "node:sqlite";

import SQLiteClient from "../SQLiteClient";

// expo-sqlite binds undefined as null, node:sqlite rejects it
const toParams = (params: any[] = []) => params.map((param) => param ?? null);

// tests only: SQLiteClient backed by an in-memory node:sqlite database instead of expo-sqlite
export const createNodeSQLiteClient = (migrations: any[] = []) => {
  const db = new DatabaseSync(":memory:");
  const client = new SQLiteClient("test", migrations);
  client.privateDb = {
    runAsync: async (sql: string, params?: any[]) => {
      const { lastInsertRowid, changes } = db
        .prepare(sql)
        .run(...toParams(params));
      return { lastInsertRowId: Number(lastInsertRowid), changes };
    },
    execAsync: async (sql: string) => db.exec(sql),
    getFirstAsync: async (sql: string, params?: any[]) =>
      db.prepare(sql).get(...toParams(params)) ?? null,
    getAllAsync: async (sql: string, params?: any[]) =>
      db.prepare(sql).all(...toParams(params)),
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
  } as any;
  return { client, db };
};
