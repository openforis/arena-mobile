// Runs the given task on every item, with at most `concurrency` tasks running at the same time.
// Items are processed in order; processing stops early when `shouldStop` returns true.
const runWithConcurrency = async <T>({
  items,
  concurrency,
  task,
  shouldStop,
}: {
  items: T[];
  concurrency: number;
  task: (item: T) => Promise<void>;
  shouldStop?: () => boolean;
}): Promise<void> => {
  let nextIndex = 0;

  const runNext = async (): Promise<void> => {
    if (nextIndex >= items.length || shouldStop?.()) return;
    const item = items[nextIndex]!;
    nextIndex += 1;
    await task(item);
    await runNext();
  };

  const workersCount = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: workersCount }, () => runNext()));
};

export const PromiseUtils = {
  runWithConcurrency,
};
