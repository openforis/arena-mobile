import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Magnetometer } from "expo-sensors";

import { Numbers, Objects } from "@openforis/arena-core";

import { AverageAnglePicker } from "utils/AverageAnglePicker";
import { Functions } from "utils/Functions";

const updateHeadingThrottleDelay = 200;
const averageAnglePicker = new AverageAnglePicker();

const radsToDegrees = (rads) =>
  (rads >= 0 ? rads : rads + 2 * Math.PI) * (180 / Math.PI);

const magnetometerDataToAngle = (magnetometer) => {
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
    (data) => {
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
      magnetometerSubscriptionRef.current?.remove();
    };
  }, [subscribeToMagnetometerData]);

  return { magnetometerAvailable, heading };
};
