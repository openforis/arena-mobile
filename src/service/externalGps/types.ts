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
  disconnect: () => Promise<void>;
};

export type ExternalGpsTransport = {
  listSources: () => Promise<GpsSourceDescriptor[]>;
  connect: (sourceId: string) => Promise<ExternalGpsConnection>;
};
