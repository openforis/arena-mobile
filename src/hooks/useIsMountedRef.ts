import { useRef, useEffect } from "react";
// @ts-expect-error TS(2307): Cannot find module 'utils' or its corresponding ty... Remove this comment to see the full error message
import { Refs } from "utils";

export const useIsMountedRef = ({ delay = 0 } = { delay: 0 }) => {
  const mountedRef = useRef(false);
  const mountedTimeoutRef = useRef(null); // avoid a render after unmount

  useEffect(() => {
    if (delay > 0) {
      // set mounted with a timeout
      // @ts-expect-error TS(2322): Type 'number' is not assignable to type 'null'.
      mountedTimeoutRef.current = setTimeout(() => {
        mountedTimeoutRef.current = null;
        mountedRef.current = true;
      }, delay);
    } else {
      // delay = 0 : set mounted immediately
      mountedRef.current = true;
    }
    return () => {
      // clear timeout to avoid rendering after unmount
      Refs.clearTimeoutRef(mountedTimeoutRef);
    };
  }, [delay]);

  return mountedRef;
};
