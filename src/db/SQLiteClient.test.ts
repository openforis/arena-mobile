import SQLiteClient from "./SQLiteClient";

jest.mock("expo-sqlite", () => ({}));
jest.mock("utils", () => ({ log: { debug: jest.fn() } }));

// single connection: statements run while a transaction is open belong to it
const createClient = (migrations: any[] = []) => {
  let pending: string[] | null = null;
  const committed: string[] = [];
  const write = async (sql: string) => {
    await Promise.resolve();
    (pending ?? committed).push(sql);
    return { lastInsertRowId: 1, changes: 1 };
  };
  const client = new SQLiteClient("test", migrations);
  client.privateDb = {
    runAsync: write,
    execAsync: write,
    getFirstAsync: async () => ({
      user_version: committed.filter((sql) => sql.startsWith("PRAGMA")).length,
    }),
    withTransactionAsync: async (task: () => Promise<void>) => {
      if (pending) {
        throw new Error("cannot start a transaction within a transaction");
      }
      pending = [];
      try {
        await task();
        committed.push(...pending);
      } finally {
        pending = null;
      }
    },
  } as any;
  return { client, committed };
};

describe("SQLiteClient.transaction", () => {
  it("runs concurrent transactions one at a time", async () => {
    const { client } = createClient();
    const steps: string[] = [];
    const run = (name: string) =>
      client.transaction(async () => {
        steps.push(`${name} start`);
        await Promise.resolve();
        steps.push(`${name} end`);
      });

    await Promise.all([run("a"), run("b")]);

    expect(steps).toEqual(["a start", "a end", "b start", "b end"]);
  });

  it("runs the next transaction after a failed one", async () => {
    const { client } = createClient();
    const failed = client.transaction(async () => {
      throw new Error("failed");
    });
    const next = client.transaction(async () => {});

    await expect(failed).rejects.toThrow("failed");
    await expect(next).resolves.toBeUndefined();
  });
});

describe("SQLiteClient writes", () => {
  it("does not roll back a write issued while a failing transaction is open", async () => {
    const { client, committed } = createClient();
    const failed = client.transaction(async (tx) => {
      await tx.runSql("tx write");
      await Promise.resolve();
      throw new Error("failed");
    });
    const write = client.runSql("outside write");

    await expect(failed).rejects.toThrow("failed");
    await write;
    expect(committed).toEqual(["outside write"]);
  });

  it("runs nested transactions and writes on the tx client without deadlock", async () => {
    const { client, committed } = createClient();
    await client.transaction(async (tx) => {
      await tx.runSql("a");
      await tx.transaction(async (nested) => {
        await nested.runSql("b");
        await nested.executeSql("c");
      });
    });
    expect(committed).toEqual(["a", "b", "c"]);
  });
});

describe("SQLiteClient.runMigrationsIfNecessary", () => {
  it("commits each migration together with its version bump", async () => {
    const migration1 = async (c: SQLiteClient) =>
      c.transaction(async () => {
        await c.executeSql("migration 1");
      });
    const failingMigration = async (c: SQLiteClient) => {
      await c.executeSql("migration 2");
      throw new Error("migration failed");
    };
    const { client, committed } = createClient([migration1, failingMigration]);

    await expect(client.runMigrationsIfNecessary()).rejects.toThrow(
      "migration failed",
    );
    expect(committed).toEqual(["migration 1", "PRAGMA user_version = 1"]);
  });
});
