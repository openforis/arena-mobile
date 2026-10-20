import * as Location from "expo-location";

import { GpsSourceSetting, LocationPoint } from "model";
import { log, Permissions } from "utils";

import { ExternalGpsService } from "../externalGps/ExternalGpsService";

const { internalGpsSourceId } = ExternalGpsService;

type Subscription = { remove: () => void };

export enum LocationSourceErrorKey {
  permissionDenied = "dataEntry:positionTracking.error.permissionDenied",
  locationServicesOff = "dataEntry:positionTracking.error.locationServicesOff",
}

export class LocationSourceError extends Error {
  key: LocationSourceErrorKey;
  constructor(key: LocationSourceErrorKey) {
    super(key);
    this.key = key;
  }
}

// battery saver: fewer and less precise fixes (on Android at most one every few seconds)
const batterySaverTimeInterval = 5000;

const watchInternalGps = async ({
  batterySaver,
  distanceInterval,
  onLocation,
}: {
  batterySaver: boolean;
  distanceInterval: number;
  onLocation: (point: LocationPoint) => void;
}): Promise<Subscription> => {
  if (!(await Permissions.requestLocationForegroundPermission())) {
    throw new LocationSourceError(
      (await Permissions.isLocationServiceEnabled())
        ? LocationSourceErrorKey.permissionDenied
        : LocationSourceErrorKey.locationServicesOff,
    );
  }
  return Location.watchPositionAsync(
    batterySaver
      ? {
          accuracy: Location.Accuracy.High,
          distanceInterval,
          timeInterval: batterySaverTimeInterval,
        }
      : { accuracy: Location.Accuracy.BestForNavigation, distanceInterval },
    ({ coords }) => onLocation({ ...coords, accuracy: coords.accuracy }),
  );
};

/**
 * Starts watching the position using the preferred GPS source (same rules as useLocationWatch):
 * with "auto" a connected external GPS is used when available, falling back to the internal GPS
 * when it can't be reached or when it disconnects.
 */
const watchPosition = async ({
  preferredGpsSourceId,
  batterySaver,
  distanceInterval,
  onLocation,
}: {
  preferredGpsSourceId: string;
  batterySaver: boolean;
  distanceInterval: number;
  onLocation: (point: LocationPoint) => void;
}): Promise<Subscription> => {
  const resolvedSourceId =
    preferredGpsSourceId === GpsSourceSetting.auto
      ? await ExternalGpsService.resolveAutoSourceId()
      : preferredGpsSourceId;

  if (resolvedSourceId === internalGpsSourceId) {
    return watchInternalGps({ batterySaver, distanceInterval, onLocation });
  }

  const fallbackAllowed = preferredGpsSourceId === GpsSourceSetting.auto;
  let current: Subscription | null = null;
  let removed = false;

  const fallbackToInternal = async () => {
    if (removed || !fallbackAllowed) return;
    log.warn(
      `PositionTracking: external GPS ${resolvedSourceId} not available, using internal GPS`,
    );
    const internal = await watchInternalGps({ batterySaver, distanceInterval, onLocation });
    if (removed) {
      internal.remove();
    } else {
      current = internal;
    }
  };

  try {
    if (!(await Permissions.requestBluetoothPermissions())) {
      throw new Error("Bluetooth permission not granted");
    }
    current = await ExternalGpsService.watchPosition(
      { sourceId: resolvedSourceId },
      onLocation,
      {
        onDisconnected: () => {
          current?.remove();
          current = null;
          void fallbackToInternal().catch((error) =>
            log.error("PositionTracking: fallback to internal GPS failed", error),
          );
        },
      },
    );
  } catch (error) {
    if (!fallbackAllowed) throw error;
    log.warn("PositionTracking: external GPS connection failed", error);
    await fallbackToInternal();
  }

  return {
    remove: () => {
      removed = true;
      current?.remove();
      current = null;
    },
  };
};

export const PositionTrackingLocationSource = {
  watchPosition,
};
