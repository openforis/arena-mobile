import { LocationPoint } from "model";
import { parseGGA, parseRMC } from "./nmeaSentenceParser";

const knotsToMetersPerSecond = (knots: number): number => knots * 0.514444;

/**
 * NMEA doesn't report a meters-based accuracy the way expo-location/CoreLocation do:
 * GGA only gives HDOP, a unitless dilution-of-precision multiplier. This estimates
 * accuracy in meters as `HDOP * UERE`, a commonly used rough conversion (User
 * Equivalent Range Error). This is an approximation, not a measured value - it is
 * intentionally more generous (lower UERE) for DGPS/SBAS-corrected fixes
 * (fixQuality 2 or 4/5) than for plain GPS fixes (fixQuality 1).
 */
const estimateAccuracyMeters = ({
  hdop,
  fixQuality,
}: {
  hdop: number | null | undefined;
  fixQuality: number | undefined;
}): number | null => {
  if (hdop === null || hdop === undefined) return null;
  const uereMeters = fixQuality && fixQuality >= 2 ? 2.5 : 5;
  return hdop * uereMeters;
};

/**
 * Merges the latest $--GGA (position/altitude/HDOP) with the most recently seen
 * $--RMC (speed/course) into LocationPoint objects, mirroring what
 * expo-location's watchPositionAsync callback provides.
 *
 * GGA carries a complete fix on its own, so each valid GGA sentence produces one
 * LocationPoint; RMC is only used to fill in speed/heading when available and
 * reasonably recent.
 */
export const createNmeaLocationPointAssembler = () => {
  let lastTrack: { speedKnots?: number | null; courseDegrees?: number | null } =
    {};

  const ingest = (sentence: string): LocationPoint | null => {
    const rmc = parseRMC(sentence);
    if (rmc) {
      lastTrack = rmc.valid
        ? { speedKnots: rmc.speedKnots, courseDegrees: rmc.courseDegrees }
        : {};
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
      accuracy: estimateAccuracyMeters({
        hdop: gga.hdop,
        fixQuality: gga.fixQuality,
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
