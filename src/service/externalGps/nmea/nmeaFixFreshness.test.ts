import {
  createNmeaFixFreshnessFilter,
  nmeaTimeToSecondsOfDay,
} from "./nmeaFixFreshness";

jest.mock("../../../utils", () => ({
  log: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

// "HHmmss.ss" of the given UTC milliseconds, shifted back by `lagSeconds`
const nmeaTimeAt = (nowMs: number, lagSeconds = 0): string => {
  const date = new Date(nowMs - lagSeconds * 1000);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}.00`;
};

describe("nmeaTimeToSecondsOfDay", () => {
  it("parses times with and without decimals", () => {
    expect(nmeaTimeToSecondsOfDay("000000")).toBe(0);
    expect(nmeaTimeToSecondsOfDay("164452.50")).toBe(
      16 * 3600 + 44 * 60 + 52.5,
    );
  });

  it("returns null for missing or malformed times", () => {
    expect(nmeaTimeToSecondsOfDay(undefined)).toBeNull();
    expect(nmeaTimeToSecondsOfDay("")).toBeNull();
    expect(nmeaTimeToSecondsOfDay("1644")).toBeNull();
    expect(nmeaTimeToSecondsOfDay("250000")).toBeNull();
  });
});

describe("createNmeaFixFreshnessFilter", () => {
  const startMs = Date.UTC(2026, 9, 7, 16, 42, 14);
  let nowMs = startMs;
  const now = () => nowMs;

  beforeEach(() => {
    nowMs = startMs;
  });

  it("accepts fixes within the normal delivery delay", () => {
    const filter = createNmeaFixFreshnessFilter({ now });

    expect(filter.isFresh(nmeaTimeAt(nowMs))).toBe(true);
    expect(filter.isFresh(nmeaTimeAt(nowMs, 6))).toBe(true);
  });

  it("accepts fixes without a usable time", () => {
    const filter = createNmeaFixFreshnessFilter({ now });

    expect(filter.isFresh(undefined)).toBe(true);
  });

  it("discards a backlog delivered at once, then accepts the current fixes", () => {
    const filter = createNmeaFixFreshnessFilter({ now });

    // 9 minutes of buffered 1Hz fixes drained in about a second
    const backlogSeconds = 540;
    for (let lag = backlogSeconds; lag > 40; lag--) {
      nowMs += 2;
      expect(filter.isFresh(nmeaTimeAt(startMs, lag))).toBe(false);
    }
    nowMs = startMs + 2000;
    expect(filter.isFresh(nmeaTimeAt(nowMs, 1))).toBe(true);
  });

  it("keeps discarding a backlog that takes long to drain", () => {
    const filter = createNmeaFixFreshnessFilter({ now });

    // 20s of draining, each fix 10s newer than the previous one
    for (let step = 0; step < 20; step++) {
      nowMs = startMs + step * 1000;
      const lag = 600 - step * 10;
      expect(filter.isFresh(nmeaTimeAt(nowMs, lag))).toBe(false);
    }
  });

  it("accepts fixes again once a constant lag shows the device clock is off", () => {
    const filter = createNmeaFixFreshnessFilter({ now });
    const clockDifferenceSeconds = 3600;

    // real-time 1Hz stream, always an hour behind the device clock
    for (let second = 0; second < 10; second++) {
      nowMs = startMs + second * 1000;
      expect(filter.isFresh(nmeaTimeAt(nowMs, clockDifferenceSeconds))).toBe(
        false,
      );
    }
    nowMs = startMs + 10000;
    expect(filter.isFresh(nmeaTimeAt(nowMs, clockDifferenceSeconds))).toBe(
      true,
    );
    nowMs += 1000;
    expect(filter.isFresh(nmeaTimeAt(nowMs, clockDifferenceSeconds))).toBe(
      true,
    );
    // a backlog is still detected relative to the compensated clock
    expect(
      filter.isFresh(nmeaTimeAt(nowMs, clockDifferenceSeconds + 300)),
    ).toBe(false);
  });

  it("accepts fixes ahead of the device clock", () => {
    const filter = createNmeaFixFreshnessFilter({ now });

    expect(filter.isFresh(nmeaTimeAt(nowMs, -120))).toBe(true);
  });

  it("handles fixes across midnight UTC", () => {
    nowMs = Date.UTC(2026, 9, 8, 0, 0, 2);
    const filter = createNmeaFixFreshnessFilter({ now });

    expect(filter.isFresh("235959.00")).toBe(true);
    expect(filter.isFresh("235000.00")).toBe(false);
  });
});
