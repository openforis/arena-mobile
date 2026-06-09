import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Accelerometer, Magnetometer } from "expo-sensors";

import { Numbers } from "@openforis/arena-core";

import { Functions } from "utils/Functions";
import { log } from "utils/Logger";
import { ScreenOrientation } from "model";
import { DeviceInfoSelectors } from "state";

type Vector3 = { x: number; y: number; z: number };

const SENSOR_UPDATE_INTERVAL_MS = 50; // 20 Hz
const THROTTLE_DELAY_MS = 50;
// Low-pass filter factor: higher = more responsive, lower = smoother
const EMA_ALPHA = 0.25;

// Rotate sensor vectors from device frame to portrait-equivalent frame so the
// heading formula always operates on portrait-oriented coordinates.
// Rotation conventions match expo-screen-orientation Orientation values:
//   PORTRAIT_UP (1)    → identity
//   PORTRAIT_DOWN (2)  → 180° around z
//   LANDSCAPE_LEFT (3) → device rotated 90° CCW, top points left: x'=-y, y'=x
//   LANDSCAPE_RIGHT(4) → device rotated 90° CW,  top points right: x'=y, y'=-x
const toPortraitFrame = (v: Vector3, orientation: number): Vector3 => {
  switch (orientation) {
    case ScreenOrientation.keys.PORTRAIT_DOWN:
      return { x: -v.x, y: -v.y, z: v.z };
    case ScreenOrientation.keys.LANDCAPE_LEFT:
      return { x: -v.y, y: v.x, z: v.z };
    case ScreenOrientation.keys.LANDSCAPE_RIGHT:
      return { x: v.y, y: -v.x, z: v.z };
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
//   Heading (CW from North) = atan2(East, North)
const computeTiltCompensatedHeading = (
  mag: Vector3,
  acc: Vector3,
): number => {
  const { x: mx, y: my, z: mz } = mag;
  const { x: ax, y: ay, z: az } = acc;

  const aNorm = Math.hypot(ax * ax + ay * ay + az * az);
  if (aNorm < 0.001) return 0;

  const axN = ax / aNorm;
  const ayN = ay / aNorm;
  const azN = az / aNorm;

  // ay = -g·sinφ  →  φ = atan2(-ay, √(ax²+az²))
  const roll = Math.atan2(-ayN, Math.hypot(axN * axN + azN * azN));
  // ax = g·cosφ·sinθ, az = g·cosφ·cosθ  →  θ = atan2(ax, az)
  const pitch = Math.atan2(axN, azN);

  const cosRoll = Math.cos(roll);
  const sinRoll = Math.sin(roll);
  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);

  const east = mx * cosPitch - mz * sinPitch;
  const north =
    my * cosRoll + (mx * sinPitch + mz * cosPitch) * sinRoll;

  return Numbers.absMod(360)(Math.atan2(east, north) * (180 / Math.PI));
};

// Circular EMA that handles 0/360 wrap-around
const circularEma = (prev: number, next: number, alpha: number): number => {
  const diff = next - prev;
  // Wrap difference to [-180, 180]
  const wrappedDiff = ((diff % 360) + 540) % 360 - 180;
  return Numbers.absMod(360)(prev + alpha * wrappedDiff);
};

export const useMagnetometerHeading = () => {
  const magRef = useRef<Vector3 | null>(null);
  const accRef = useRef<Vector3 | null>(null);
  const filteredHeadingRef = useRef<number | null>(null);

  const [heading, setHeading] = useState(0);
  const [magnetometerAvailable, setMagnetometerAvailable] = useState(true);

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

    const o = orientationRef.current;
    const magP = toPortraitFrame(mag, o);
    const accP = toPortraitFrame(acc, o);

    const raw = computeTiltCompensatedHeading(magP, accP);
    const prev = filteredHeadingRef.current;
    const filtered =
      prev === null ? raw : circularEma(prev, raw, EMA_ALPHA);
    filteredHeadingRef.current = filtered;
    setHeading(Numbers.roundToPrecision(filtered, 1));
  }, []);

  const throttledUpdateHeading = useMemo(
    () => Functions.throttle(updateHeading, THROTTLE_DELAY_MS),
    [updateHeading],
  );

  useEffect(() => {
    let magSub: ReturnType<typeof Magnetometer.addListener> | undefined;
    let accSub: ReturnType<typeof Accelerometer.addListener> | undefined;

    Magnetometer.isAvailableAsync()
      .then((available) => {
        if (!available) {
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
        log.error("Error initializing magnetometer", error);
        setMagnetometerAvailable(false);
      });

    return () => {
      magSub?.remove();
      accSub?.remove();
    };
  }, [throttledUpdateHeading]);

  return { magnetometerAvailable, heading };
};
