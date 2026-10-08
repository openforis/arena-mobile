/**
 * Calls `onStall` every time `timeoutMs` elapse without notifyData() being called,
 * i.e. once per `timeoutMs` for as long as the stream stays silent.
 */
export const createStreamStallMonitor = ({
  timeoutMs,
  onStall,
}: {
  timeoutMs: number;
  onStall: () => void;
}): { notifyData: () => void; stop: () => void } => {
  let stopped = false;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const clear = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  const arm = () => {
    clear();
    if (stopped) return;
    timeout = setTimeout(() => {
      timeout = null;
      onStall();
      arm();
    }, timeoutMs);
  };

  arm();

  return {
    notifyData: arm,
    stop: () => {
      stopped = true;
      clear();
    },
  };
};
