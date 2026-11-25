import { TimeUtils } from "./TimeUtils";

const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;
const day = 24 * hour;
const year = 365 * day;

// echoes key and params so assertions can check which message was chosen
const t = (key: string, params?: Record<string, unknown> | null) =>
  params ? `${key}${JSON.stringify(params)}` : key;

describe("TimeUtils.extractParts", () => {
  test("returns null for falsy time", () => {
    expect(TimeUtils.extractParts(0)).toBeNull();
    expect(TimeUtils.extractParts(undefined)).toBeNull();
    expect(TimeUtils.extractParts(null)).toBeNull();
  });

  test("splits time into non-overlapping parts", () => {
    const time = 2 * year + 3 * day + 4 * hour + 5 * minute + 6 * second + 999;
    expect(TimeUtils.extractParts(time)).toEqual({
      year: 2,
      day: 3,
      hour: 4,
      minute: 5,
      second: 6,
    });
  });

  test("handles exact boundaries", () => {
    expect(TimeUtils.extractParts(day)).toEqual({
      year: 0,
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
    });
    expect(TimeUtils.extractParts(day - 1)).toEqual({
      year: 0,
      day: 0,
      hour: 23,
      minute: 59,
      second: 59,
    });
  });
});

describe("TimeUtils.formatRemainingTime", () => {
  test("returns empty string for falsy time", () => {
    expect(TimeUtils.formatRemainingTime({ time: 0, t })).toBe("");
  });

  test("uses the largest non-zero time part", () => {
    expect(TimeUtils.formatRemainingTime({ time: 3 * day + hour, t })).toBe(
      `common:remainingTime.timePartLeft${JSON.stringify({
        timePart: `common:timePart.day${JSON.stringify({ count: 3 })}`,
        count: 3,
      })}`,
    );
  });

  test("falls back to 'less than one' when below upToTimePart", () => {
    expect(TimeUtils.formatRemainingTime({ time: 30 * second, t })).toBe(
      `common:remainingTime.lessThanOneTimePart${JSON.stringify({
        timePart: "common:timePart.minute",
      })}`,
    );
  });

  test("respects a custom upToTimePart", () => {
    expect(
      TimeUtils.formatRemainingTime({
        time: 30 * second,
        upToTimePart: "second",
        t,
      }),
    ).toContain("common:timePart.second");
    expect(
      TimeUtils.formatRemainingTime({
        time: 30 * minute,
        upToTimePart: "hour",
        t,
      }),
    ).toBe(
      `common:remainingTime.lessThanOneTimePart${JSON.stringify({
        timePart: "common:timePart.hour",
      })}`,
    );
  });
});

describe("TimeUtils.formatRemainingTimeIfLessThan1Day", () => {
  const { formatModes } = TimeUtils;
  const format = (time: number, formatMode?: string) =>
    TimeUtils.formatRemainingTimeIfLessThan1Day({ time, t, formatMode });

  test("returns empty string for falsy time or time of at least one day", () => {
    expect(format(0)).toBe("");
    expect(format(day)).toBe("");
    expect(format(year)).toBe("");
  });

  test("hours and minutes in the different format modes", () => {
    const time = 2 * hour + 5 * minute;
    expect(format(time, formatModes.short)).toBe("02:05");
    expect(format(time, formatModes.full)).toBe(
      `common:remainingTime.canLastHoursAndMinutes${JSON.stringify({ hours: 2, minutes: 5 })}`,
    );
    expect(format(time, formatModes.compact)).toBe(
      `common:remainingTime.hoursAndMinutesShort${JSON.stringify({ hours: 2, minutes: 5 })}`,
    );
  });

  test("defaults to full format mode", () => {
    expect(format(2 * hour + 5 * minute)).toContain(
      "common:remainingTime.canLastHoursAndMinutes",
    );
  });

  test("only hours or only minutes", () => {
    const hourText = `common:timePart.hour${JSON.stringify({ count: 3 })}`;
    expect(format(3 * hour, formatModes.short)).toBe(`3 ${hourText}`);
    expect(format(3 * hour, formatModes.full)).toBe(
      `common:remainingTime.canLastTimePart${JSON.stringify({ count: 3, timePart: hourText })}`,
    );
    const minuteText = `common:timePart.minute${JSON.stringify({ count: 45 })}`;
    expect(format(45 * minute + 10 * second, formatModes.compact)).toBe(
      `common:remainingTime.timePartLeft${JSON.stringify({ count: 45, timePart: minuteText })}`,
    );
  });

  test("less than one minute", () => {
    expect(format(59 * second)).toBe(
      `common:remainingTime.lessThanOneTimePart${JSON.stringify({
        timePart: "common:timePart.minute",
      })}`,
    );
  });
});
