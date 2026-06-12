import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Accelerometer, Magnetometer } from "expo-sensors";

import { Numbers } from "@openforis/arena-core";

import { Functions } from "utils/Functions";
import { log } from "utils/Logger";
import { ScreenOrientation } from "model";
import { DeviceInfoSelectors } from "state";

import { circularEma, EMA_ALPHA } from "./headingUtils";

type Vector3 = { x: number; y: number; z: number };

const SENSOR_UPDATE_INTERVAL_MS = 50; // 20 Hz
const THROTTLE_DELAY_MS = 50;

// Some devices don't report LANDSCAPE_RIGHT (4) when rotating 180° within
// landscape — the expo key stays at LANDSCAPE_LEFT (3). Use normalized acc.x
// to detect the actual sub-orientation regardless of whether the accelerometer
// returns m/s² or G-units: in LANDSCAPE_LEFT the visual top is -x (normalised
// acc.x < 0 when tilted up), in LANDSCAPE_RIGHT the visual top is +x (> 0).
// Threshold 0.05 ≈ 3° tilt; below that the expo key is the fallback.
const adjustOrientationForLandscape = (o: any, acc: Vector3): any => {
  if (!ScreenOrientation.isLandscape(o)) return o;
  const accNorm = Math.hypot(acc.x, acc.y, acc.z);
  if (accNorm < 0.001) return o;
  const normalizedAccX = acc.x / accNorm;
  if (Math.abs(normalizedAccX) > 0.05) {
    return normalizedAccX > 0
      ? ScreenOrientation.keys.LANDSCAPE_RIGHT
      : ScreenOrientation.keys.LANDSCAPE_LEFT;
  }
  return o;
};

// Rotate sensor vectors from device frame to portrait-equivalent frame so the
// heading formula always operates on portrait-oriented coordinates.
// Rotation conventions match expo-screen-orientation Orientation values:
//   PORTRAIT_UP (1)    → identity
//   PORTRAIT_DOWN (2)  → 180° around z
//   LANDSCAPE_LEFT (3) → device rotated 90° CW,  top points right: x'=y,  y'=-x
//   LANDSCAPE_RIGHT(4) → device rotated 90° CCW, top points left:  x'=-y, y'=x
const toPortraitFrame = (v: Vector3, orientation: number): Vector3 => {
  switch (orientation) {
    case ScreenOrientation.keys.PORTRAIT_DOWN:
      return { x: -v.x, y: -v.y, z: v.z };
    case ScreenOrientation.keys.LANDSCAPE_LEFT:
      return { x: v.y, y: -v.x, z: v.z };
    case ScreenOrientation.keys.LANDSCAPE_RIGHT:
      return { x: -v.y, y: v.x, z: v.z };
    default: // PORTRAIT_UP or unknown
      return v;
  }
};

// expo-sensors frame: x=right, y=toward screen-top, z=out-of-screen.
// When flat face-up pointing North: x=East, y=North, z=Up.
//
// Roll  φ = rotation around x-axis (screen top tips toward/away from user)
// Pitch θ = rotation around y-axis (right side tips down/up)
//
// Derivation: B_world = Rx(-φ)·Ry(-θ)·B_device
//   East  = mx·cos θ − mz·sin θ
//   North = my·cos φ + (mx·sin θ + mz·cos θ)·sin φ
//   Heading (CW from North) = atan2(−East, North)
const computeTiltCompensatedHeading = (mag: Vector3, acc: Vector3): number => {
  const { x: mx, y: my, z: mz } = mag;
  const { x: ax, y: ay, z: az } = acc;

  const aNorm = Math.hypot(ax, ay, az);
  if (aNorm < 0.001) return 0;

  const axN = ax / aNorm;
  const ayN = ay / aNorm;
  const azN = az / aNorm;

  // ay = -g·sinφ  →  φ = atan2(-ay, √(ax²+az²))
  const roll = Math.atan2(-ayN, Math.hypot(axN, azN));
  // ax = g·cosφ·sinθ, az = g·cosφ·cosθ  →  θ = atan2(ax, az)
  const pitch = Math.atan2(axN, azN);

  const cosRoll = Math.cos(roll);
  const sinRoll = Math.sin(roll);
  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);

  const east = mx * cosPitch - mz * sinPitch;
  const north = my * cosRoll + (mx * sinPitch + mz * cosPitch) * sinRoll;

  return Numbers.absMod(360)(Math.atan2(-east, north) * (180 / Math.PI));
};

export const useMagnetometerHeading = ({
  enabled = true,
}: { enabled?: boolean } = {}) => {
  const magRef = useRef<Vector3 | null>(null);
  const accRef = useRef<Vector3 | null>(null);
  const filteredHeadingRef = useRef<number | null>(null);

  const [heading, setHeading] = useState(0);
  const [magnetometerAvailable, setMagnetometerAvailable] = useState(true);
  const [prevEnabled, setPrevEnabled] = useState(enabled);

  if (prevEnabled !== enabled) {
    setPrevEnabled(enabled);
    if (enabled && !magnetometerAvailable) {
      setMagnetometerAvailable(true);
    }
  }

  const orientation = DeviceInfoSelectors.useOrientation();
  // Keep a ref so the sensor callback always reads the latest orientation
  // without needing to re-subscribe when orientation changes.
  const orientationRef = useRef(orientation);
  useEffect(() => {
    orientationRef.current = orientation;
  }, [orientation]);

  const updateHeading = useCallback(() => {
    const mag = magRef.current;
    const acc = accRef.current;
    if (!mag || !acc) return;

    const o = adjustOrientationForLandscape(orientationRef.current, acc);

    const magP = toPortraitFrame(mag, o);
    const accP = toPortraitFrame(acc, o);

    const raw = computeTiltCompensatedHeading(magP, accP);
    const prev = filteredHeadingRef.current;
    const filtered = prev === null ? raw : circularEma(prev, raw, EMA_ALPHA);
    filteredHeadingRef.current = filtered;
    setHeading(Numbers.roundToPrecision(filtered, 1));
  }, []);

  const throttledUpdateHeading = useMemo(
    () => Functions.throttle(updateHeading, THROTTLE_DELAY_MS),
    [updateHeading],
  );

  useEffect(() => {
    if (!enabled) {
      filteredHeadingRef.current = null;
      return;
    }

    let cancelled = false;
    let magSub: ReturnType<typeof Magnetometer.addListener> | undefined;
    let accSub: ReturnType<typeof Accelerometer.addListener> | undefined;

    Promise.all([
      Magnetometer.isAvailableAsync(),
      Accelerometer.isAvailableAsync(),
    ])
      .then(([magAvailable, accAvailable]) => {
        if (cancelled) return;
        if (!magAvailable || !accAvailable) {
          setMagnetometerAvailable(false);
          return;
        }

        Magnetometer.setUpdateInterval(SENSOR_UPDATE_INTERVAL_MS);
        Accelerometer.setUpdateInterval(SENSOR_UPDATE_INTERVAL_MS);

        magSub = Magnetometer.addListener((data) => {
          magRef.current = data;
          throttledUpdateHeading();
        });

        accSub = Accelerometer.addListener((data) => {
          accRef.current = data;
        });
      })
      .catch((error: any) => {
        if (cancelled) return;
        log.error("Error initializing magnetometer", error);
        setMagnetometerAvailable(false);
      });

    return () => {
      cancelled = true;
      magSub?.remove();
      accSub?.remove();
    };
  }, [enabled, throttledUpdateHeading]);

  return { magnetometerAvailable, heading };
};
