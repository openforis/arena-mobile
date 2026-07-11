import { NmeaFix, NmeaTrack } from "../types";

/**
 * Validates the trailing "*XX" checksum: XOR of every character between "$" and "*".
 */
const isChecksumValid = (sentence: string): boolean => {
  const match = /^\$([^*]+)\*([0-9A-Fa-f]{2})\s*$/.exec(sentence.trim());
  if (!match) return false;
  const [, body = "", checksumHex = ""] = match;
  let checksum = 0;
  for (let i = 0; i < body.length; i++) {
    checksum ^= body.charCodeAt(i);
  }
  return checksum === parseInt(checksumHex, 16);
};

const stripChecksum = (sentence: string): string =>
  sentence.trim().replace(/\*[0-9A-Fa-f]{2}\s*$/, "");

// e.g. "4916.45,N" -> 49 + 16.45/60
const parseCoordinate = (
  value: string,
  hemisphere: string,
  degreesDigits: number,
): number | null => {
  if (!value || !hemisphere) return null;
  const degrees = Number(value.slice(0, degreesDigits));
  const minutes = Number(value.slice(degreesDigits));
  if (Number.isNaN(degrees) || Number.isNaN(minutes)) return null;
  const decimal = degrees + minutes / 60;
  return hemisphere === "S" || hemisphere === "W" ? -decimal : decimal;
};

const toNumberOrNull = (value: string): number | null =>
  value === "" || value === undefined ? null : Number(value);

/**
 * Parses a $--GGA sentence (fix data): lat/long, altitude, HDOP, fix quality.
 * Returns null if the sentence isn't a valid/parseable GGA or has no fix.
 */
export const parseGGA = (sentence: string): NmeaFix | null => {
  if (!isChecksumValid(sentence)) return null;
  const fields = stripChecksum(sentence).split(",");
  // $--GGA,time,lat,N/S,lon,E/W,fixQuality,numSatellites,hdop,altitude,M,...
  if (fields.length < 10 || !/GGA$/.test(fields[0] ?? "")) return null;

  const fixQuality = Number(fields[6]);
  if (!fixQuality) return null; // 0 = invalid/no fix

  const latitude = parseCoordinate(fields[2] ?? "", fields[3] ?? "", 2);
  const longitude = parseCoordinate(fields[4] ?? "", fields[5] ?? "", 3);
  if (latitude === null || longitude === null) return null;

  return {
    latitude,
    longitude,
    altitude: toNumberOrNull(fields[9] ?? ""),
    hdop: toNumberOrNull(fields[8] ?? ""),
    fixQuality,
    satellitesInUse: toNumberOrNull(fields[7] ?? "") ?? undefined,
    time: fields[1] || undefined,
  };
};

/**
 * Parses a $--RMC sentence (recommended minimum): speed, course, validity, date/time.
 */
export const parseRMC = (sentence: string): NmeaTrack | null => {
  if (!isChecksumValid(sentence)) return null;
  const fields = stripChecksum(sentence).split(",");
  // $--RMC,time,status,lat,N/S,lon,E/W,speedKnots,course,date,...
  if (fields.length < 10 || !/RMC$/.test(fields[0] ?? "")) return null;

  return {
    valid: fields[2] === "A",
    speedKnots: toNumberOrNull(fields[7] ?? ""),
    courseDegrees: toNumberOrNull(fields[8] ?? ""),
    date: fields[9] || undefined,
    time: fields[1] || undefined,
  };
};
