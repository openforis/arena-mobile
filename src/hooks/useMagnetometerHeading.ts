import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Location from "expo-location";

import { Numbers, Objects } from "@openforis/arena-core";

import { AverageAnglePicker } from "utils/AverageAnglePicker";
import { Functions } from "utils/Functions";
import { DeviceInfoSelectors } from "state/deviceInfo";
import { Permissions } from "utils/Permissions";
import { log } from "utils/Logger";

const updateHeadingThrottleDelay = 200;
const averageAnglePicker = new AverageAnglePicker();

const locationHeadingToAngle = (
  angle: number,
  orientationIsLandscape: boolean,
): number => {
  const result =
    Numbers.roundToPrecision(angle, 1) + (orientationIsLandscape ? 0 : -90);
  return Numbers.absMod(360)(result);
};

export const useMagnetometerHeading = () => {
  const headingWatchSubscriptionRef = useRef(null as any);
  const lastMagnetometerAngleRef = useRef(0);
  const orientationIsLandscape =
    DeviceInfoSelectors.useOrientationIsLandscape();

  const [heading, setHeading] = useState(0);
  const [magnetometerAvailable, setMagnetometerAvailable] = useState(true);

  const updateHeading = useCallback(() => {
    const lastHeading = lastMagnetometerAngleRef.current;
    if (Objects.isNotEmpty(lastHeading)) {
      setHeading(lastHeading);
    }
  }, []);

  const throttledUpdateHeading = useMemo(
    () => Functions.throttle(updateHeading, updateHeadingThrottleDelay),
    [updateHeading],
  );

  const watchHeading = useCallback(async () => {
    const onError: Location.LocationErrorCallback = (error: any) => {
      log.error("Error receiving magnetometer data", error);
      setMagnetometerAvailable(false);
    };
    try {
      const locationPermission =
        await Permissions.requestLocationForegroundPermission();
      if (!locationPermission) {
        log.warn(
          "Location permission not granted. Magnetometer heading will not be available.",
        );
        setMagnetometerAvailable(false);
        return;
      }

      headingWatchSubscriptionRef.current = await Location.watchHeadingAsync(
        (headingData) => {
          const { trueHeading, magHeading } = headingData;

          const prevMagnetometerAngle = lastMagnetometerAngleRef.current;

          // Prefer trueHeading (geographic north), fallback to magneticHeading
          const currentHeading = trueHeading >= 0 ? trueHeading : magHeading;
          const adjustedHeading = locationHeadingToAngle(
            currentHeading,
            orientationIsLandscape,
          );
          let avgAngle = averageAnglePicker.push(adjustedHeading);
          avgAngle = Numbers.absMod(360)(avgAngle);
          lastMagnetometerAngleRef.current = avgAngle;
          if (avgAngle !== prevMagnetometerAngle) {
            throttledUpdateHeading();
          }
        },
        onError,
      );
    } catch (error: any) {
      onError(error?.message || String(error));
    }
  }, [orientationIsLandscape, throttledUpdateHeading]);

  useEffect(() => {
    watchHeading();
    return () => {
      headingWatchSubscriptionRef.current?.remove();
    };
  }, [watchHeading]);

  return { magnetometerAvailable, heading };
};
