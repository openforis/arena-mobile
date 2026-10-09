import { GpsSourceSetting, LocationPoint } from "model";
import { log } from "utils";
import { ExternalGpsConnectionManager } from "./connectionManager";
import { createNmeaFixFreshnessFilter } from "./nmea/nmeaFixFreshness";
import { createNmeaStreamDiagnostics } from "./nmea/nmeaStreamDiagnostics";
import { createNmeaLocationPointAssembler } from "./nmea/nmeaToLocationPoint";
import { createStreamStallMonitor } from "./streamStallMonitor";
import { bluetoothClassicTransport } from "./transport/bluetoothClassicTransport";
import {
  DiscoveredGpsDevice,
  ExternalGpsConnection,
  GpsSourceDescriptor,
} from "./types";

export const internalGpsSourceId: string = GpsSourceSetting.internal;

const diagnosticsLogIntervalMs = 15000;
// A healthy stream delivers data every few seconds at most (1Hz sentences, handed
// over by Bluetooth in batches).
const streamStallTimeoutMs = 8000;
const maxReconnectsPerWatch = 3;

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
 *
 * A connection can stay "connected" while no data comes through anymore (seen with
 * the Bad Elf on iOS, where the stream then stays silent for good), so the stream is
 * monitored: after `streamStallTimeoutMs` of silence the session init is sent again
 * (when the device uses one), and if it's still silent after as long again, the
 * connection is replaced with a fresh one.
 */
const watchPosition = async (
  { sourceId }: { sourceId: string },
  callback: (locationPoint: LocationPoint) => void,
  listeners?: {
    onDisconnected?: () => void;
  },
): Promise<{ remove: () => void }> => {
  let connection = await ExternalGpsConnectionManager.acquire(
    sourceId,
    bluetoothClassicTransport,
  );
  const freshnessFilter = createNmeaFixFreshnessFilter();
  const assembler = createNmeaLocationPointAssembler({
    hdopAccuracyFactorMeters: connection.hdopAccuracyFactorMeters,
    isFixFresh: freshnessFilter.isFresh,
  });

  const diagnostics = createNmeaStreamDiagnostics();
  const logDiagnostics = (prefix: string) =>
    log.info(`ExternalGps: ${prefix} ${sourceId} - ${diagnostics.summary()}`);

  let removed = false;
  // false while the connection is being replaced, or if replacing it failed
  let holdsConnection = true;
  let reconnectsCount = 0;
  let sessionInitRestarted = false;
  // time of the last data chunk, or of the connection being attached if none yet
  let lastActivityAt = Date.now();
  let subscriptions: { remove: () => void }[] = [];

  const onChunk = (chunk: string) => {
    lastActivityAt = Date.now();
    sessionInitRestarted = false;
    stallMonitor.notifyData();

    let locationPoint: LocationPoint | null = null;
    try {
      locationPoint = assembler.ingest(chunk);
    } catch (error) {
      log.warn("ExternalGps: failed to parse NMEA sentence", error);
    }
    const chunkSample = diagnostics.record(chunk, locationPoint);
    if (chunkSample) log.debug("ExternalGps: data received:", chunkSample);

    if (!locationPoint) return;
    try {
      callback(locationPoint);
    } catch (error) {
      log.warn("ExternalGps: error handling location point", error);
    }
  };

  const attach = (connectionToAttach: ExternalGpsConnection) => {
    subscriptions = [
      connectionToAttach.onData(onChunk),
      connectionToAttach.onDisconnected(() => {
        listeners?.onDisconnected?.();
      }),
    ];
  };

  const detach = () => {
    for (const subscription of subscriptions) subscription.remove();
    subscriptions = [];
  };

  const reconnect = async () => {
    reconnectsCount += 1;
    log.warn(
      `ExternalGps: still no data from ${sourceId}, replacing the connection (attempt ${reconnectsCount}/${maxReconnectsPerWatch})`,
    );
    holdsConnection = false;
    detach();
    try {
      const connectionNext = await ExternalGpsConnectionManager.replace(
        sourceId,
        bluetoothClassicTransport,
        connection,
      );
      if (removed) {
        ExternalGpsConnectionManager.release(sourceId);
        return;
      }
      connection = connectionNext;
      holdsConnection = true;
      lastActivityAt = Date.now();
      sessionInitRestarted = false;
      attach(connectionNext);
    } catch (error) {
      log.warn(`ExternalGps: failed to reconnect to ${sourceId}`, error);
      if (!removed) listeners?.onDisconnected?.();
    }
  };

  const onStreamStall = () => {
    if (removed || !holdsConnection) return;

    if (!sessionInitRestarted && connection.restartSessionInit) {
      sessionInitRestarted = true;
      log.warn(
        `ExternalGps: no data from ${sourceId} for ${streamStallTimeoutMs / 1000}s, sending the session init again`,
      );
      connection.restartSessionInit();
      return;
    }
    if (reconnectsCount >= maxReconnectsPerWatch) {
      log.warn(
        `ExternalGps: no data from ${sourceId} after replacing the connection ${reconnectsCount} times, giving up`,
      );
      stallMonitor.stop();
      return;
    }
    void reconnect();
  };

  const stallMonitor = createStreamStallMonitor({
    timeoutMs: streamStallTimeoutMs,
    onStall: onStreamStall,
  });

  attach(connection);

  const diagnosticsInterval = setInterval(
    () => logDiagnostics("stream status of"),
    diagnosticsLogIntervalMs,
  );

  return {
    remove: () => {
      removed = true;
      clearInterval(diagnosticsInterval);
      stallMonitor.stop();
      logDiagnostics("stopped watching");
      detach();
      if (!holdsConnection) return;
      // a silent connection would stay silent for the next watch too
      const silent = Date.now() - lastActivityAt >= streamStallTimeoutMs;
      ExternalGpsConnectionManager.release(sourceId, { discard: silent });
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
