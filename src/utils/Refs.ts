import { RefObject } from "react";

type TimerRef = RefObject<ReturnType<typeof setTimeout> | null>;

const clearIntervalRef = (ref: TimerRef) => {
  if (ref.current) {
    clearInterval(ref.current);
    ref.current = null;
  }
};

const clearTimeoutRef = (ref: TimerRef) => {
  if (ref.current) {
    clearTimeout(ref.current);
    ref.current = null;
  }
};

export const Refs = { clearIntervalRef, clearTimeoutRef };
