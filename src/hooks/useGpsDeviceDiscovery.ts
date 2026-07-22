import { useCallback, useEffect, useRef, useState } from "react";

import { ExternalGpsService } from "service/externalGps/ExternalGpsService";
import {
  BluetoothDisabledError,
  BluetoothScanPermissionDeniedError,
} from "service/externalGps/types";
import type { DiscoveredGpsDevice } from "service/externalGps/types";
import { log } from "utils";
import { mergeDiscoveredDevice } from "./gpsDeviceDiscoveryUtils";
import { useIsMountedRef } from "./useIsMountedRef";

export type GpsDeviceDiscoveryError =
  | "permission_denied"
  | "bluetooth_disabled"
  | "unknown";

/**
 * Drives an on-demand Bluetooth GPS device discovery/pairing scan. Kept separate from
 * useAvailableGpsSources, which has a much simpler poll-and-replace lifecycle - this
 * one is a longer-running, cancellable, progressive-results operation the user starts
 * and stops explicitly.
 */
export const useGpsDeviceDiscovery = () => {
  const isMountedRef = useIsMountedRef();
  const stopRef = useRef<null | (() => Promise<void>)>(null);

  const [devices, setDevices] = useState<DiscoveredGpsDevice[]>([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<GpsDeviceDiscoveryError | null>(null);

  const stop = useCallback(async () => {
    const currentStop = stopRef.current;
    stopRef.current = null;
    if (currentStop) {
      try {
        await currentStop();
      } catch (_error) {
        // best-effort: nothing meaningful to surface if stopping the scan itself fails
      }
    }
    if (isMountedRef.current) {
      setScanning(false);
    }
  }, [isMountedRef]);

  const start = useCallback(async () => {
    await stop();
    if (!isMountedRef.current) return;

    setDevices([]);
    setError(null);
    setScanning(true);

    try {
      const { stop: stopDiscovery } =
        await ExternalGpsService.startGpsDeviceDiscovery(
          (device) => {
            if (!isMountedRef.current) return;
            setDevices((devicesPrev) => mergeDiscoveredDevice(devicesPrev, device));
          },
          () => {
            // The OS's own ~12s scan window elapsed naturally (as opposed to the user
            // tapping "stop") - just flip scanning off, the discovered list stays put.
            stopRef.current = null;
            if (isMountedRef.current) setScanning(false);
          },
        );
      if (!isMountedRef.current) {
        await stopDiscovery();
        return;
      }
      stopRef.current = stopDiscovery;
    } catch (thrownError) {
      log.warn("useGpsDeviceDiscovery: failed to start discovery", thrownError);
      if (!isMountedRef.current) return;
      setScanning(false);
      if (thrownError instanceof BluetoothScanPermissionDeniedError) {
        setError("permission_denied");
      } else if (thrownError instanceof BluetoothDisabledError) {
        setError("bluetooth_disabled");
      } else {
        setError("unknown");
      }
    }
  }, [isMountedRef, stop]);

  useEffect(() => () => void stop(), [stop]);

  return { devices, scanning, error, start, stop };
};
