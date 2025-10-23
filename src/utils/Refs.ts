const clearIntervalRef = (ref) => {
  if (ref.current) {
    clearInterval(ref.current);
    ref.current = null;
  }
};

const clearTimeoutRef = (ref) => {
  if (ref.current) {
    clearTimeout(ref.current);
    ref.current = null;
  }
};

export const Refs = { clearIntervalRef, clearTimeoutRef };
