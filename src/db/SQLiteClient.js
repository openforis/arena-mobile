import * as SQLite from "expo-sqlite";

export class DowngradeError extends Error {
  constructor() {
    super();
    this.name = "DowngradeError";
  }
}

export default class SQLiteClient {
  constructor(name, migrations, debug = false) {
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

  async runSql(sql, params) {
    const result = await this.privateDb.runAsync(sql, params);
    const { lastInsertRowId: insertId, changes: rowsAffected } = result;
    return { insertId, rowsAffected };
  }

  async executeSql(sql) {
    await this.privateDb.execAsync(sql);
  }

  async transaction(callback) {
    return this.privateDb.withTransactionAsync(callback);
  }

  async one(sql, params) {
    return this.privateDb.getFirstAsync(sql, params);
  }

  async many(sql, params) {
    return this.privateDb.getAllAsync(sql, params);
  }

  async connect() {
    if (this.privateConnected) {
      return { dbMigrationsRun: false };
    }
    try {
      console.log("=== DB connection start ===");

      this.privateDb = await SQLite.openDatabaseAsync(this.name);

      const { dbMigrationsRun, prevDbVersion, nextDbVersion } =
        await this.runMigrationsIfNecessary();

      this.privateConnected = true;
      console.log("=== DB connection complete ===");
      return { dbMigrationsRun, prevDbVersion, nextDbVersion };
    } catch (error) {
      console.log(error);
      if (error instanceof DowngradeError) {
        throw error;
      }
      throw new Error(
        `SQLiteClient: failed to connect to database: ${this.name} details: ${error}`
      );
    }
  }

  async runMigrationsIfNecessary() {
    const dbUserVersionRow = await this.one("PRAGMA user_version");
    const prevDbVersion = dbUserVersionRow.user_version;
    console.log(`==== current DB version: ${prevDbVersion}`);
    const nextDbVersion = this.migrations.length;
    console.log(`==== next DB version: ${nextDbVersion}`);
    if (prevDbVersion > nextDbVersion) {
      throw new DowngradeError();
    }
    const dbMigrationsNecessary = prevDbVersion !== nextDbVersion;
    if (dbMigrationsNecessary) {
      const migrationsToRun = this.migrations.slice(
        prevDbVersion,
        nextDbVersion
      );
      let currentDbVersion = prevDbVersion;
      console.log("==== DB migrations start ====");
      for await (const migration of migrationsToRun) {
        await migration(this);
        currentDbVersion += 1;
        await this.runSql(`PRAGMA user_version = ${currentDbVersion}`);
      }
      console.log("==== DB migrations complete ====");
    }
    return {
      dbMigrationsRun: dbMigrationsNecessary,
      prevDbVersion,
      nextDbVersion,
    };
  }
}
