export const runConfirmedAction = async ({
  confirm,
  action,
  setRunning,
}: {
  // resolves to a falsy value when cancelled
  confirm: () => Promise<unknown>;
  action: () => Promise<unknown>;
  setRunning: (running: boolean) => void;
}): Promise<boolean> => {
  if (!(await confirm())) return false;
  setRunning(true);
  try {
    await action();
  } finally {
    setRunning(false);
  }
  return true;
};
