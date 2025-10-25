import { useDispatch } from "react-redux";
import { useEffect, useRef } from "react";
import * as Battery from "expo-battery";

import { DeviceInfoActions } from "./actions";

export const useBatteryStateListener = () => {
  const dispatch = useDispatch();
  const subscriptionRef = useRef<Battery.Subscription | null>(null);

  useEffect(() => {
    subscriptionRef.current = Battery.addBatteryStateListener(() => {
      dispatch(DeviceInfoActions.updatePowerState() as never);
    });
    return () => {
      const subscription = subscriptionRef.current;
      if (subscription) {
        subscription.remove();
      }
    };
  }, [dispatch]);
};
