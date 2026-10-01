import { LocationPoint } from "model";
import { NmeaGst } from "../types";
import { parseGGA, parseGST, parseRMC } from "./nmeaSentenceParser";

const knotsToMetersPerSecond = (knots: number): number => knots * 0.514444;

/**
 * NMEA doesn't report a meters-based accuracy the way expo-location/CoreLocation do:
 * GGA only gives HDOP, a unitless dilution-of-precision multiplier. This estimates
 * accuracy in meters as `HDOP * UERE`, a commonly used rough conversion (User
 * Equivalent Range Error). This is an approximation, not a measured value - it is
 * intentionally more generous (lower UERE) for DGPS/SBAS-corrected fixes
 * (fixQuality 2 or 4/5) than for plain GPS fixes (fixQuality 1).
 *
 * Used only as a fallback when the receiver doesn't emit $--GST (see
 * `accuracyFromGst` below), which reports the receiver's own measured error.
 */
const estimateAccuracyMeters = ({
  hdop,
  fixQuality,
  hdopAccuracyFactorMeters,
}: {
  hdop: number | null | undefined;
  fixQuality: number | undefined;
  hdopAccuracyFactorMeters?: number;
}): number | null => {
  if (hdop === null || hdop === undefined) return null;
  // A vendor-documented factor (see vendorProtocolRegistry) takes precedence over
  // the generic UERE guess, so the value matches what the receiver itself displays.
  if (hdopAccuracyFactorMeters) return hdop * hdopAccuracyFactorMeters;
  const uereMeters = fixQuality && fixQuality >= 2 ? 2.5 : 5;
  return hdop * uereMeters;
};

/**
 * Combines $--GST's lat/lon error standard deviations into a single horizontal
 * accuracy figure in meters, treating them as independent error components.
 * This is a measured value from the receiver, so it's preferred over the
 * HDOP-based estimate above whenever the receiver emits GST.
 */
const accuracyFromGst = (gst: NmeaGst | null): number | null => {
  const { latitudeErrorMeters, longitudeErrorMeters } = gst ?? {};
  if (latitudeErrorMeters === null || latitudeErrorMeters === undefined)
    return null;
  if (longitudeErrorMeters === null || longitudeErrorMeters === undefined)
    return null;
  return Math.hypot(latitudeErrorMeters, longitudeErrorMeters);
};

/**
 * Merges the latest $--GGA (position/altitude/HDOP) with the most recently seen
 * $--RMC (speed/course) and $--GST (measured position error) into LocationPoint
 * objects, mirroring what expo-location's watchPositionAsync callback provides.
 *
 * GGA carries a complete fix on its own, so each valid GGA sentence produces one
 * LocationPoint; RMC is only used to fill in speed/heading when available
 * (using the most recently seen RMC sentence).
 */
export const createNmeaLocationPointAssembler = ({
  hdopAccuracyFactorMeters,
}: { hdopAccuracyFactorMeters?: number } = {}) => {
  let lastTrack: { speedKnots?: number | null; courseDegrees?: number | null } =
    {};
  let lastGst: NmeaGst | null = null;

  const ingest = (chunk: string): LocationPoint | null => {
    // Resync on "$": some receivers interleave binary packets with NMEA, so a chunk
    // can carry leading non-NMEA bytes before the actual sentence.
    const sentence = chunk.slice(Math.max(chunk.lastIndexOf("$"), 0));

    const rmc = parseRMC(sentence);
    if (rmc) {
      lastTrack = rmc.valid
        ? { speedKnots: rmc.speedKnots, courseDegrees: rmc.courseDegrees }
        : {};
      return null;
    }

    const gst = parseGST(sentence);
    if (gst) {
      lastGst = gst;
      return null;
    }

    const gga = parseGGA(sentence);
    if (!gga) return null;

    const { speedKnots, courseDegrees } = lastTrack;
    return {
      latitude: gga.latitude,
      longitude: gga.longitude,
      altitude: gga.altitude ?? null,
      altitudeAccuracy: null,
      accuracy:
        accuracyFromGst(lastGst) ??
        estimateAccuracyMeters({
          hdop: gga.hdop,
          fixQuality: gga.fixQuality,
          hdopAccuracyFactorMeters,
        }),
      heading: courseDegrees ?? null,
      speed:
        speedKnots === null || speedKnots === undefined
          ? null
          : knotsToMetersPerSecond(speedKnots),
    };
  };

  return { ingest };
};
