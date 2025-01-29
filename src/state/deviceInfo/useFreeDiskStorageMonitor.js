import { useDispatch } from "react-redux";
import { useEffect, useRef } from "react";

import { DeviceInfoActions } from "./actions";

const freeDiskSpaceUpdateDelay = 60000; // 60 sec

export const useFreeDiskStorageMonitor = () => {
  const dispatch = useDispatch();
  const intervalIdRef = useRef(null);

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
