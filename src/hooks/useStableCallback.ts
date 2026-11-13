import { useCallback, useLayoutEffect, useRef } from "react";

// same function identity across renders, always calling the latest callback (for event handlers only)
export const useStableCallback = <A extends any[], R>(
  callback: (...args: A) => R,
): ((...args: A) => R) => {
  const callbackRef = useRef(callback);
  useLayoutEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  return useCallback((...args: A) => callbackRef.current(...args), []);
};
