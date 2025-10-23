import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Magnetometer } from "expo-sensors";

import { Numbers, Objects } from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'utils/AverageAnglePicker' or i... Remove this comment to see the full error message
import { AverageAnglePicker } from "utils/AverageAnglePicker";
// @ts-expect-error TS(2307): Cannot find module 'utils/Functions' or its corres... Remove this comment to see the full error message
import { Functions } from "utils/Functions";

const updateHeadingThrottleDelay = 200;
const averageAnglePicker = new AverageAnglePicker();

const radsToDegrees = (rads: any) => (rads >= 0 ? rads : rads + 2 * Math.PI) * (180 / Math.PI);

const magnetometerDataToAngle = (magnetometer: any) => {
  let angle = 0;
  if (magnetometer) {
    const { x, y } = magnetometer;
    const rads = Math.atan2(y, x);
    angle = radsToDegrees(rads);
  }
  // Match the device top with 0° degree angle (by default 0° starts from the right of the device)
  let result = Numbers.roundToPrecision(angle, 1) - 90;
  result = Numbers.absMod(360)(result);
  return result;
};

export const useMagnetometerHeading = () => {
  const magnetometerSubscriptionRef = useRef(null);
  const lastMagnetometerAngleRef = useRef(0);

  const [magnetometerAvailable, setMagnetometerAvailable] = useState(true);
  const [heading, setHeading] = useState(0);

  const updateHeading = useCallback(() => {
    const lastHeading = lastMagnetometerAngleRef.current;
    if (Objects.isNotEmpty(lastHeading)) {
      setHeading(lastHeading);
    }
  }, []);

  const throttledUpdateHeading = useMemo(
    () => Functions.throttle(updateHeading, updateHeadingThrottleDelay),
    [updateHeading]
  );

  const onMagnetometerData = useCallback(
    (data: any) => {
      const prevMagnetometerAngle = lastMagnetometerAngleRef.current;
      const magnetometerAngle = magnetometerDataToAngle(data);
      let avgAngle = averageAnglePicker.push(magnetometerAngle);
      avgAngle = Numbers.absMod(360)(avgAngle);

      lastMagnetometerAngleRef.current = avgAngle;

      if (avgAngle !== prevMagnetometerAngle) {
        throttledUpdateHeading();
      }
    },
    [throttledUpdateHeading]
  );

  const subscribeToMagnetometerData = useCallback(async () => {
    try {
      const available = await Magnetometer.isAvailableAsync();
      if (available) {
        // @ts-expect-error TS(2322): Type 'EventSubscription' is not assignable to type... Remove this comment to see the full error message
        magnetometerSubscriptionRef.current =
          Magnetometer.addListener(onMagnetometerData);
      } else {
        setMagnetometerAvailable(false);
      }
    } catch (_error) {
      setMagnetometerAvailable(false);
    }
  }, [onMagnetometerData, setMagnetometerAvailable]);

  useEffect(() => {
    subscribeToMagnetometerData();
    return () => {
      // @ts-expect-error TS(2339): Property 'remove' does not exist on type 'never'.
      magnetometerSubscriptionRef.current?.remove();
    };
  }, [subscribeToMagnetometerData]);

  return { magnetometerAvailable, heading };
};
