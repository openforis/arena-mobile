import { useDispatch } from "react-redux";
import { useEffect, useRef } from "react";

import { DeviceInfoActions } from "./actions";

const freeDiskSpaceUpdateDelay = 60000; // 60 sec

export const useFreeDiskStorageMonitor = () => {
  const dispatch = useDispatch();
  const intervalIdRef = useRef(null);

  useEffect(() => {
    // @ts-expect-error TS(2322): Type 'number' is not assignable to type 'null'.
    intervalIdRef.current = setInterval(() => {
      // @ts-expect-error TS(2345): Argument of type '(dispatch: any, getState: any) =... Remove this comment to see the full error message
      dispatch(DeviceInfoActions.updateFreeDiskStorage());
    }, freeDiskSpaceUpdateDelay);

    return () => {
      const intervalId = intervalIdRef.current;
      if (intervalId) {
        clearTimeout(intervalId);
      }
    };
  }, [dispatch]);
};
