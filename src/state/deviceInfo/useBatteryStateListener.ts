import { useEffect, useRef } from "react";
import * as Battery from "expo-battery";

import { useAppDispatch } from "state/store";
import { DeviceInfoActions } from "./actions";

export const useBatteryStateListener = () => {
  const dispatch = useAppDispatch();
  const subscriptionRef = useRef<Battery.Subscription | null>(null);

  useEffect(() => {
    subscriptionRef.current = Battery.addBatteryStateListener(() => {
      dispatch(DeviceInfoActions.updatePowerState());
    });
    return () => {
      const subscription = subscriptionRef.current;
      if (subscription) {
        subscription.remove();
      }
    };
  }, [dispatch]);
};
