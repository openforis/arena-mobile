import { PromiseUtils } from "./PromiseUtils";

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

describe("PromiseUtils.runWithConcurrency", () => {
  test("processes every item, never exceeding the concurrency", async () => {
    const items = Array.from({ length: 20 }, (_, index) => index);
    const processed: number[] = [];
    let running = 0;
    let maxRunning = 0;

    await PromiseUtils.runWithConcurrency({
      items,
      concurrency: 3,
      task: async (item) => {
        running += 1;
        maxRunning = Math.max(maxRunning, running);
        await sleep(1);
        processed.push(item);
        running -= 1;
      },
    });

    expect(processed).toHaveLength(items.length);
    expect(new Set(processed).size).toBe(items.length);
    expect(maxRunning).toBe(3);
  });

  test("stops early when requested", async () => {
    const items = Array.from({ length: 100 }, (_, index) => index);
    const processed: number[] = [];

    await PromiseUtils.runWithConcurrency({
      items,
      concurrency: 2,
      task: async (item) => {
        processed.push(item);
      },
      shouldStop: () => processed.length >= 10,
    });

    expect(processed.length).toBeGreaterThanOrEqual(10);
    expect(processed.length).toBeLessThan(items.length);
  });

  test("handles empty lists", async () => {
    const task = jest.fn(async () => {});
    await PromiseUtils.runWithConcurrency({ items: [], concurrency: 4, task });
    expect(task).not.toHaveBeenCalled();
  });
});
