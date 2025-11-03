import { useEffect, useRef } from "react";

import { DeviceInfoActions } from "./actions";
import { useAppDispatch } from "state/store";

const freeDiskSpaceUpdateDelay = 60000; // 60 sec

export const useFreeDiskStorageMonitor = () => {
  const dispatch = useAppDispatch();
  const intervalIdRef = useRef<number | null>(null);

  useEffect(() => {
    intervalIdRef.current = setInterval(() => {
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
