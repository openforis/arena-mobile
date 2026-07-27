export type GpsSourceType = "internal" | "external";

export type GpsSourceDescriptor = {
  id: string; // "internal" or `external:${deviceAddress}`
  type: GpsSourceType;
  label: string;
  vendor?: string;
  connected?: boolean;
};

export type NmeaFix = {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  hdop?: number | null;
  fixQuality?: number; // 0 = invalid, 1 = GPS, 2 = DGPS, ...
  satellitesInUse?: number;
  time?: string; // UTC time, "HHmmss(.sss)", from the sentence
};

export type NmeaTrack = {
  valid: boolean;
  speedKnots?: number | null;
  courseDegrees?: number | null;
  date?: string; // UTC date, "ddmmyy"
  time?: string; // UTC time, "HHmmss(.sss)"
};

// $--GST: receiver-reported standard deviation of the position error, in meters.
// Only emitted by some receivers (mainly survey-grade units); absent from most consumer ones.
export type NmeaGst = {
  latitudeErrorMeters: number | null;
  longitudeErrorMeters: number | null;
  time?: string; // UTC time, "HHmmss(.sss)"
};

export type ExternalGpsDataListener = (chunk: string) => void;

export type ExternalGpsConnection = {
  onData: (listener: ExternalGpsDataListener) => { remove: () => void };
  onDisconnected: (listener: () => void) => { remove: () => void };
  disconnect: () => Promise<void>;
};

// A nearby Bluetooth device found by a discovery scan, not yet OS-bonded/paired -
// distinct from GpsSourceDescriptor, which represents a device that's already usable
// as a GPS source (bonded, or the internal GPS).
export type DiscoveredGpsDevice = {
  address: string;
  name: string; // raw Bluetooth name; "" if the OS hasn't resolved one yet
  vendor?: string; // recognizeVendor() result; undefined if unrecognized
};

// Thrown by ExternalGpsTransport.startDiscovery so callers (useGpsDeviceDiscovery,
// GpsDevicePairingModal) can distinguish these two recoverable states from a generic
// failure and prompt the user accordingly, rather than just showing a dead end.
export class BluetoothScanPermissionDeniedError extends Error {}
export class BluetoothDisabledError extends Error {}

export type ExternalGpsTransport = {
  listSources: () => Promise<GpsSourceDescriptor[]>;
  connect: (sourceId: string) => Promise<ExternalGpsConnection>;
  isConnected: (sourceId: string) => Promise<boolean>;
  isBluetoothEnabled: () => Promise<boolean>;
  requestBluetoothEnabled: () => Promise<boolean>;
  // Streams live results via onDeviceDiscovered as the OS finds them, since the
  // native startDiscovery() promise only resolves once the whole ~12s scan finishes -
  // that natural end is reported via onFinished, so callers can stop showing a
  // "scanning" state without the caller having to poll or guess a timeout. Returns a
  // { stop } handle (matching the { remove }/{ stop } idiom used elsewhere in this
  // service) to cancel discovery early.
  startDiscovery: (
    onDeviceDiscovered: (device: DiscoveredGpsDevice) => void,
    onFinished?: () => void,
  ) => Promise<{ stop: () => Promise<void> }>;
  // Triggers the OS bonding/pairing dialog for the given device address. Resolves
  // with a ready-to-use GpsSourceDescriptor once paired.
  pairDevice: (address: string) => Promise<GpsSourceDescriptor>;
};
