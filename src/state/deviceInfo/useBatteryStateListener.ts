import { useDispatch } from "react-redux";
import { useEffect, useRef } from "react";
import * as Battery from "expo-battery";

import { DeviceInfoActions } from "./actions";

export const useBatteryStateListener = () => {
  const dispatch = useDispatch();
  const subscriptionRef = useRef(null);

  useEffect(() => {
    subscriptionRef.current = Battery.addBatteryStateListener(() => {
      dispatch(DeviceInfoActions.updatePowerState());
    });
    return () => {
      subscriptionRef?.current?.remove?.();
    };
  }, [dispatch]);
};
