import SQLiteClient from "./SQLiteClient";

jest.mock("expo-sqlite", () => ({}));
jest.mock("utils", () => ({ log: { debug: jest.fn() } }));

const createClient = () => {
  let transactionOpen = false;
  const client = new SQLiteClient("test", []);
  client.privateDb = {
    withTransactionAsync: async (task: () => Promise<void>) => {
      if (transactionOpen) {
        throw new Error("cannot start a transaction within a transaction");
      }
      transactionOpen = true;
      try {
        await task();
      } finally {
        transactionOpen = false;
      }
    },
  } as any;
  return client;
};

describe("SQLiteClient.transaction", () => {
  it("runs concurrent transactions one at a time", async () => {
    const client = createClient();
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
    const client = createClient();
    const failed = client.transaction(async () => {
      throw new Error("failed");
    });
    const next = client.transaction(async () => {});

    await expect(failed).rejects.toThrow("failed");
    await expect(next).resolves.toBeUndefined();
  });
});
