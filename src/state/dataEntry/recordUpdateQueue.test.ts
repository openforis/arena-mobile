import { serializeRecordUpdate } from "./recordUpdateQueue";

const run = (update: () => Promise<any>) =>
  serializeRecordUpdate(update)(jest.fn(), jest.fn());

describe("serializeRecordUpdate", () => {
  it("runs updates one at a time, in order", async () => {
    const steps: string[] = [];
    const update = (name: string) => async () => {
      steps.push(`${name} start`);
      await Promise.resolve();
      steps.push(`${name} end`);
      return name;
    };

    const results = await Promise.all([run(update("a")), run(update("b"))]);

    expect(results).toEqual(["a", "b"]);
    expect(steps).toEqual(["a start", "a end", "b start", "b end"]);
  });

  it("goes on after a failed update", async () => {
    const failed = run(async () => {
      throw new Error("failed");
    });
    const next = run(async () => "next");

    await expect(failed).rejects.toThrow("failed");
    await expect(next).resolves.toBe("next");
  });
});
