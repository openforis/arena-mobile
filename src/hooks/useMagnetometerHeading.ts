import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Magnetometer, MagnetometerMeasurement } from "expo-sensors";

import { Numbers, Objects } from "@openforis/arena-core";

import { AverageAnglePicker } from "utils/AverageAnglePicker";
import { Functions } from "utils/Functions";
import { DeviceInfoSelectors } from "state/deviceInfo";

const updateHeadingThrottleDelay = 200;
const averageAnglePicker = new AverageAnglePicker();

const radsToDegrees = (rads: any) =>
  (rads >= 0 ? rads : rads + 2 * Math.PI) * (180 / Math.PI);

const magnetometerMeasurementToAngle = ({
  magnetometerMeasurement,
  orientationIsLandscape = false,
}: {
  magnetometerMeasurement: MagnetometerMeasurement;
  orientationIsLandscape?: boolean;
}) => {
  let angle = 0;
  if (magnetometerMeasurement) {
    const { x, y } = magnetometerMeasurement;
    const rads = Math.atan2(y, x);
    angle = radsToDegrees(rads);
  }
  // Match the device top with 0° degree angle (by default 0° starts from the right of the device)
  let result =
    Numbers.roundToPrecision(angle, 1) + (orientationIsLandscape ? 0 : -90);
  result = Numbers.absMod(360)(result);
  return result;
};

export const useMagnetometerHeading = () => {
  const magnetometerSubscriptionRef = useRef(null as any);
  const lastMagnetometerAngleRef = useRef(0);
  const orientationIsLandscape =
    DeviceInfoSelectors.useOrientationIsLandscape();

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
    (magnetometerMeasurement: MagnetometerMeasurement) => {
      const prevMagnetometerAngle = lastMagnetometerAngleRef.current;
      const magnetometerAngle = magnetometerMeasurementToAngle({
        magnetometerMeasurement,
        orientationIsLandscape,
      });
      let avgAngle = averageAnglePicker.push(magnetometerAngle);
      avgAngle = Numbers.absMod(360)(avgAngle);

      lastMagnetometerAngleRef.current = avgAngle;

      if (avgAngle !== prevMagnetometerAngle) {
        throttledUpdateHeading();
      }
    },
    [orientationIsLandscape, throttledUpdateHeading]
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
