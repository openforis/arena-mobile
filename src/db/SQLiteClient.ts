import * as SQLite from "expo-sqlite";

import { Promises } from "@openforis/arena-core";

import { log } from "utils";

export class DowngradeError extends Error {
  constructor() {
    super();
    this.name = "DowngradeError";
  }
}

export default class SQLiteClient {
  migrations: any[];
  name: any;
  privateConnected: boolean;
  privateDb: SQLite.SQLiteDatabase | null;
  private transactionsQueue: Promise<unknown> = Promise.resolve();
  constructor(name: any, migrations: any[], _debug = false) {
    this.name = name;
    this.migrations = migrations;
    this.privateDb = null;
    this.privateConnected = false;
  }

  get connected() {
    return this.privateConnected;
  }

  get db() {
    return this.privateDb;
  }

  // the tx client passed to transaction callbacks: it skips the queue and joins nested transactions
  private inTransaction = false;

  // writes share the connection: one issued while a transaction is open would be rolled back with it
  private enqueue<T>(task: () => Promise<T>): Promise<T> {
    if (this.inTransaction) return task();
    const result = this.transactionsQueue.then(task);
    this.transactionsQueue = result.catch(() => {});
    return result;
  }

  runSql(sql: any, params?: any) {
    return this.enqueue(async () => {
      const result = await this.privateDb!.runAsync(sql, params);
      const { lastInsertRowId: insertId, changes: rowsAffected } = result;
      return { insertId, rowsAffected };
    });
  }

  executeSql(sql: any) {
    return this.enqueue(() => this.privateDb!.execAsync(sql));
  }

  // the database file is complete (WAL merged) and not written while the task runs (e.g. to copy it)
  withConsistentDbFile<T>(task: () => Promise<T>): Promise<T> {
    return this.enqueue(async () => {
      await this.privateDb!.execAsync("PRAGMA wal_checkpoint(TRUNCATE)");
      return task();
    });
  }

  // inside the callback use only the given tx client: calls on this client wait for the transaction to end
  transaction(callback: (tx: SQLiteClient) => Promise<void>): Promise<void> {
    if (this.inTransaction) return callback(this);
    return this.enqueue(() =>
      this.privateDb!.withTransactionAsync(() => {
        const tx = new SQLiteClient(this.name, []);
        tx.privateDb = this.privateDb;
        tx.privateConnected = true;
        tx.inTransaction = true;
        return callback(tx);
      }),
    );
  }

  one(sql: any, params?: any) {
    return this.privateDb!.getFirstAsync(sql, params);
  }

  many(sql: any, params?: any) {
    return this.privateDb!.getAllAsync(sql, params);
  }

  async connect() {
    if (this.privateConnected) {
      return { dbMigrationsRun: false };
    }
    try {
      log.debug("=== DB connection start ===");

      this.privateDb = await SQLite.openDatabaseAsync(this.name);

      const { dbMigrationsRun, prevDbVersion, nextDbVersion } =
        await this.runMigrationsIfNecessary();

      this.privateConnected = true;
      log.debug("=== DB connection complete ===");
      return { dbMigrationsRun, prevDbVersion, nextDbVersion };
    } catch (error) {
      log.debug(error);
      if (error instanceof DowngradeError) {
        throw error;
      }
      throw new Error(
        `SQLiteClient: failed to connect to database: ${this.name} details: ${error}`,
        { cause: error },
      );
    }
  }

  async runMigrationsIfNecessary() {
    const dbUserVersionRow: any = await this.one("PRAGMA user_version");
    const prevDbVersion = dbUserVersionRow.user_version;
    log.debug(`==== current DB version: ${prevDbVersion}`);
    const nextDbVersion = this.migrations.length;
    log.debug(`==== next DB version: ${nextDbVersion}`);
    if (prevDbVersion > nextDbVersion) {
      throw new DowngradeError();
    }
    const dbMigrationsNecessary = prevDbVersion !== nextDbVersion;
    if (dbMigrationsNecessary) {
      const migrationsToRun = this.migrations.slice(
        prevDbVersion,
        nextDbVersion,
      );
      let currentDbVersion = prevDbVersion;
      log.debug("==== DB migrations start ====");
      await Promises.each(migrationsToRun, async (migration) => {
        const version = currentDbVersion + 1;
        // the version bump is committed together with the migration
        await this.transaction(async (tx) => {
          await migration(tx);
          await tx.runSql(`PRAGMA user_version = ${version}`);
        });
        currentDbVersion = version;
      });
      log.debug("==== DB migrations complete ====");
    }
    return {
      dbMigrationsRun: dbMigrationsNecessary,
      prevDbVersion,
      nextDbVersion,
    };
  }
}
