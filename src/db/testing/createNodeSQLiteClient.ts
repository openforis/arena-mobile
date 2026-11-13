import { DatabaseSync } from "node:sqlite";

import SQLiteClient from "../SQLiteClient";

// expo-sqlite binds undefined as null, node:sqlite rejects it
const toParams = (params: any[] = []) => params.map((param) => param ?? null);

// tests only: SQLiteClient backed by an in-memory node:sqlite database instead of expo-sqlite
export const createNodeSQLiteClient = (migrations: any[] = []) => {
  const db = new DatabaseSync(":memory:");
  const client = new SQLiteClient("test", migrations);
  client.privateDb = {
    runAsync: (sql: string, params?: any[]) => {
      const { lastInsertRowid, changes } = db
        .prepare(sql)
        .run(...toParams(params));
      return Promise.resolve({
        lastInsertRowId: Number(lastInsertRowid),
        changes,
      });
    },
    execAsync: (sql: string) => Promise.resolve(db.exec(sql)),
    getFirstAsync: (sql: string, params?: any[]) =>
      Promise.resolve(db.prepare(sql).get(...toParams(params)) ?? null),
    getAllAsync: (sql: string, params?: any[]) =>
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
  } as any;
  return { client, db };
};
