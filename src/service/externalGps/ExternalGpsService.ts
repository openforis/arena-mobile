import { GpsSourceSetting, LocationPoint } from "model";
import { log } from "utils";
import { ExternalGpsConnectionManager } from "./connectionManager";
import { createNmeaLocationPointAssembler } from "./nmea/nmeaToLocationPoint";
import { bluetoothClassicTransport } from "./transport/bluetoothClassicTransport";
import { DiscoveredGpsDevice, GpsSourceDescriptor } from "./types";

export const internalGpsSourceId: string = GpsSourceSetting.internal;

const internalGpsSource: GpsSourceDescriptor = {
  id: internalGpsSourceId,
  type: "internal",
  label: "Internal GPS",
};

/**
 * Lists every GPS source the user can pick from: the phone's internal GPS, always
 * first, plus any recognized external GPS device currently bonded/connected (via OS
 * Bluetooth pairing - this app never scans/pairs devices itself).
 */
const listAvailableSources = async (): Promise<GpsSourceDescriptor[]> => {
  const externalSources = await bluetoothClassicTransport.listSources();
  return [internalGpsSource, ...externalSources];
};

/**
 * Resolves the "auto" setting value to the first recognized external device if one
 * is available, else falls back to internal GPS.
 */
const resolveAutoSourceId = async (): Promise<string> => {
  const externalSources = await bluetoothClassicTransport.listSources();
  const resolved = externalSources[0]?.id ?? internalGpsSourceId;
  log.info(
    resolved === internalGpsSourceId
      ? "ExternalGps: auto source resolution - no external device found, using internal GPS"
      : `ExternalGps: auto source resolution - resolved to ${resolved}`,
  );
  return resolved;
};

/**
 * Starts watching position from the given external GPS source, feeding raw NMEA
 * chunks through the parser and pushing normalized LocationPoints to `callback`.
 * Mirrors expo-location's watchPositionAsync return shape ({ remove }) so
 * useLocationWatch can treat both providers identically.
 */
const watchPosition = async (
  { sourceId }: { sourceId: string },
  callback: (locationPoint: LocationPoint) => void,
  listeners?: {
    onDisconnected?: () => void;
  },
): Promise<{ remove: () => void }> => {
  const connection = await ExternalGpsConnectionManager.acquire(
    sourceId,
    bluetoothClassicTransport,
  );
  const assembler = createNmeaLocationPointAssembler();

  const subscription = connection.onData((chunk) => {
    try {
      const locationPoint = assembler.ingest(chunk);
      if (locationPoint) callback(locationPoint);
    } catch (error) {
      log.warn("ExternalGps: failed to parse NMEA sentence", error);
    }
  });
  const disconnectSubscription = connection.onDisconnected(() => {
    listeners?.onDisconnected?.();
  });

  return {
    remove: () => {
      subscription.remove();
      disconnectSubscription.remove();
      ExternalGpsConnectionManager.release(sourceId);
    },
  };
};

/**
 * Closes every pooled external GPS connection immediately (app backgrounding,
 * explicit source switch) rather than waiting for the idle grace period.
 */
const disconnectAll = () => ExternalGpsConnectionManager.closeAll();

const isBluetoothEnabled = (): Promise<boolean> =>
  bluetoothClassicTransport.isBluetoothEnabled();

const requestBluetoothEnabled = (): Promise<boolean> =>
  bluetoothClassicTransport.requestBluetoothEnabled();

/**
 * Starts scanning for nearby Bluetooth devices for on-demand pairing (Android only -
 * see ExternalGps plan doc; iOS MFi accessory pairing works entirely differently and
 * isn't triggerable this way). Streams results via onDeviceDiscovered as the OS finds
 * them rather than waiting for the whole scan to finish.
 */
const startGpsDeviceDiscovery = (
  onDeviceDiscovered: (device: DiscoveredGpsDevice) => void,
  onFinished?: () => void,
) => bluetoothClassicTransport.startDiscovery(onDeviceDiscovered, onFinished);

/**
 * Pairs (OS-level bonds) the device at the given address and returns it as a
 * ready-to-use GpsSourceDescriptor. This has no side effect on any cached source list
 * - callers should follow up with listAvailableSources()/useAvailableGpsSources's
 * refresh so the newly paired device shows up wherever sources are listed.
 */
const pairGpsDevice = (address: string): Promise<GpsSourceDescriptor> =>
  bluetoothClassicTransport.pairDevice(address);

export const ExternalGpsService = {
  internalGpsSourceId,
  listAvailableSources,
  resolveAutoSourceId,
  watchPosition,
  disconnectAll,
  isBluetoothEnabled,
  requestBluetoothEnabled,
  startGpsDeviceDiscovery,
  pairGpsDevice,
};
