import { DependencyList, useEffect, useState } from "react";

type AsyncValueOptions<T> = {
  enabled?: boolean;
  initialValue: T;
  isEqual?: (valuePrev: T, valueNext: T) => boolean;
  // called also for ignored (stale) fetches; without it a rejection stays unhandled
  onError?: (error: unknown) => void;
};

// starts the fetch; the returned function makes it ignore the result
export const startAsyncValueFetch = <T>({
  fetch,
  onValue,
  onError,
}: {
  fetch: () => Promise<T>;
  onValue: (value: T) => void;
  onError?: (error: unknown) => void;
}): (() => void) => {
  let cancelled = false;
  void fetch().then((value) => {
    if (!cancelled) onValue(value);
  }, onError);
  return () => {
    cancelled = true;
  };
};

// value fetched when the deps change (if enabled); results of stale fetches are ignored
export const useAsyncValueEffect = <T>(
  fetch: () => Promise<T>,
  deps: DependencyList,
  { enabled = true, initialValue, isEqual, onError }: AsyncValueOptions<T>,
) => {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    if (!enabled) return;
    return startAsyncValueFetch({
      fetch,
      onValue: (valueNext) =>
        setValue((valuePrev) =>
          isEqual?.(valuePrev, valueNext) ? valuePrev : valueNext,
        ),
      onError,
    });
    // deps are checked at the call sites (additionalHooks in eslint.config.mjs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  return [value, setValue] as const;
};
