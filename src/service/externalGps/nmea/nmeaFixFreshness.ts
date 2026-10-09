import { log } from "utils";

const secondsPerDay = 86400;
// Well above the normal delivery delay: Bluetooth hands sentences over in batches a
// few seconds apart, so a healthy stream is routinely 3-6s behind.
const staleLagThresholdSeconds = 30;
const clockDifferenceConfirmMs = 10000;
const clockDifferenceLagToleranceSeconds = 5;

/**
 * Converts an NMEA UTC time field ("HHmmss" or "HHmmss.sss") into seconds since
 * midnight UTC; null if missing or malformed.
 */
export const nmeaTimeToSecondsOfDay = (time?: string): number | null => {
  const match = /^(\d{2})(\d{2})(\d{2}(?:\.\d+)?)$/.exec(time ?? "");
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  if (hours > 23 || minutes > 59 || seconds >= 61) return null;
  return hours * 3600 + minutes * 60 + seconds;
};

/**
 * Tells whether a fix is current, by comparing its NMEA UTC time with the device
 * clock. Needed because a stream that has gone silent on the receiving side keeps
 * being buffered: when it resumes, minutes of old sentences are delivered at once,
 * and without this check they would be handed out as the current position (e.g. the
 * coordinates of the previous plot).
 *
 * The device clock can't be fully trusted (set manually, or drifted on a tablet that
 * has been offline for a long time), and discarding every fix because of it would be
 * worse than the problem being solved. The two cases are told apart by how the lag
 * evolves: a buffered backlog is drained much faster than real time, so its lag
 * shrinks by minutes within a second or two, whereas a clock difference gives a lag
 * that stays constant while sentences keep arriving in real time. A lag that stays
 * constant for `clockDifferenceConfirmMs` is therefore taken as the clocks'
 * difference, and compensated for from then on.
 */
export const createNmeaFixFreshnessFilter = ({
  now = Date.now,
}: { now?: () => number } = {}) => {
  let clockDifferenceSeconds = 0;
  let staleRun: {
    startedAtMs: number;
    minLagSeconds: number;
    maxLagSeconds: number;
    count: number;
  } | null = null;

  // How far behind the device clock the fix is, in seconds, normalized to
  // (-12h, +12h] since the sentence carries only the time of day.
  const calculateLagSeconds = (fixSecondsOfDay: number, nowMs: number) => {
    const nowSecondsOfDay = (nowMs / 1000) % secondsPerDay;
    const lagRaw = nowSecondsOfDay - fixSecondsOfDay - clockDifferenceSeconds;
    const lag = ((lagRaw % secondsPerDay) + secondsPerDay) % secondsPerDay;
    return lag > secondsPerDay / 2 ? lag - secondsPerDay : lag;
  };

  const endStaleRun = () => {
    if (!staleRun) return;
    log.info(
      `ExternalGps: positions are current again (${staleRun.count} stale positions discarded)`,
    );
    staleRun = null;
  };

  const isFresh = (time?: string): boolean => {
    const fixSecondsOfDay = nmeaTimeToSecondsOfDay(time);
    // no usable time in the sentence: can't tell, don't discard
    if (fixSecondsOfDay === null) return true;

    const nowMs = now();
    const lagSeconds = calculateLagSeconds(fixSecondsOfDay, nowMs);

    // a fix "from the future" can only be a clock difference, never a backlog
    if (lagSeconds <= staleLagThresholdSeconds) {
      endStaleRun();
      return true;
    }

    if (staleRun) {
      staleRun.minLagSeconds = Math.min(staleRun.minLagSeconds, lagSeconds);
      staleRun.maxLagSeconds = Math.max(staleRun.maxLagSeconds, lagSeconds);
      staleRun.count += 1;
    } else {
      staleRun = {
        startedAtMs: nowMs,
        minLagSeconds: lagSeconds,
        maxLagSeconds: lagSeconds,
        count: 1,
      };
      log.warn(
        `ExternalGps: discarding stale positions (fix time ${time} is ${Math.round(lagSeconds)}s behind the device clock)`,
      );
    }

    const lagConstant =
      staleRun.maxLagSeconds - staleRun.minLagSeconds <=
      clockDifferenceLagToleranceSeconds;
    if (!lagConstant) {
      // backlog being drained: keep watching from the current lag
      staleRun.startedAtMs = nowMs;
      staleRun.minLagSeconds = lagSeconds;
      staleRun.maxLagSeconds = lagSeconds;
      return false;
    }
    if (nowMs - staleRun.startedAtMs < clockDifferenceConfirmMs) return false;

    log.warn(
      `ExternalGps: fix time constantly ${Math.round(lagSeconds)}s behind the device clock while positions keep arriving: assuming the device clock is off, positions accepted (${staleRun.count} discarded)`,
    );
    clockDifferenceSeconds += lagSeconds;
    staleRun = null;
    return true;
  };

  return { isFresh };
};
