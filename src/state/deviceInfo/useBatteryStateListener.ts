import { useDispatch } from "react-redux";
import { useEffect, useRef } from "react";
import * as Battery from "expo-battery";

import { DeviceInfoActions } from "./actions";

export const useBatteryStateListener = () => {
  const dispatch = useDispatch();
  const subscriptionRef = useRef(null);

  useEffect(() => {
    // @ts-expect-error TS(2322): Type 'EventSubscription' is not assignable to type... Remove this comment to see the full error message
    subscriptionRef.current = Battery.addBatteryStateListener(() => {
      // @ts-expect-error TS(2345): Argument of type '(dispatch: any, getState: any) =... Remove this comment to see the full error message
      dispatch(DeviceInfoActions.updatePowerState());
    });
    return () => {
      // @ts-expect-error TS(2339): Property 'remove' does not exist on type 'never'.
      subscriptionRef?.current?.remove?.();
    };
  }, [dispatch]);
};
