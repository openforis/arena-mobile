const msInOneSecond = 1000;
const msInOneMinute = 60 * msInOneSecond;
const msInOneHour = msInOneMinute * 60;
const msInOneDay = msInOneHour * 24;
const msInOneYear = msInOneDay * 365;

enum TimePart {
  year = "year",
  day = "day",
  hour = "hour",
  minute = "minute",
  second = "second",
}

type TimePartsDictionary = { [key in TimePart]: number };

const msPerTimePart = {
  [TimePart.year]: msInOneYear,
  [TimePart.day]: msInOneDay,
  [TimePart.hour]: msInOneHour,
  [TimePart.minute]: msInOneMinute,
  [TimePart.second]: msInOneSecond,
};

const formatModes = {
  full: "full",
  compact: "compact",
  short: "short",
};

const _calculateValuePerTimePart = (time: number, part: TimePart) => {
  const timePartsValues = Object.values(TimePart);
  const prevTimePart = timePartsValues[timePartsValues.indexOf(part) - 1];
  const timeEffective = prevTimePart
    ? time % msPerTimePart[prevTimePart]
    : time;
  return Math.floor(timeEffective / msPerTimePart[part]);
};

const formatRemainingTime = ({
  time,
  upToTimePart = TimePart.minute,
  t,
}: any) => {
  if (!time) return "";

  const timePartsValues = Object.values(TimePart);
  const upToTimePartIndex = timePartsValues.indexOf(upToTimePart);
  const timePartsValuesFiltered = timePartsValues.slice(
    0,
    upToTimePartIndex + 1
  );
  for (const timePart of timePartsValuesFiltered) {
    const count = _calculateValuePerTimePart(time, timePart);
    if (count) {
      const timePartText = t(`common:timePart.${timePart}`, { count });
      return t("common:remainingTime.timePartLeft", {
        timePart: timePartText,
        count,
      });
    }
  }
  const upToTimePartText = t(`common:timePart.${upToTimePart}`);
  return t("common:remainingTime.lessThanOneTimePart", {
    timePart: upToTimePartText,
  });
};

const extractParts = (time: any): TimePartsDictionary | null => {
  if (!time) return null;
  const timeParts = {} as TimePartsDictionary;
  for (const timePart of Object.values(TimePart)) {
    timeParts[timePart] = _calculateValuePerTimePart(time, timePart);
  }
  return timeParts;
};

const _formatRemainingHoursAndMinutes = ({
  hours,
  minutes,
  t,
  formatMode,
}: any) => {
  switch (formatMode) {
    case formatModes.full:
      return t("common:remainingTime.canLastHoursAndMinutes", {
        hours,
        minutes,
      });
    case formatModes.compact:
      return t("common:remainingTime.hoursAndMinutesShort", {
        hours,
        minutes,
      });
    default: {
      const hoursString = String(hours).padStart(2, "0");
      const minutesString = String(minutes).padStart(2, "0");
      return `${hoursString}:${minutesString}`;
    }
  }
};

const _formatRemainingTimePart = ({ timePart, count, t, formatMode }: any) => {
  const timePartText = t(`common:timePart.${timePart}`, { count });
  switch (formatMode) {
    case formatModes.full:
      return t("common:remainingTime.canLastTimePart", {
        count,
        timePart: timePartText,
      });
    case formatModes.compact:
      return t("common:remainingTime.timePartLeft", {
        count,
        timePart: timePartText,
      });
    default:
      return `${count} ${timePartText}`;
  }
};

const formatRemainingTimeIfLessThan1Day = ({
  time,
  t,
  formatMode = formatModes.full,
}: any) => {
  const parts = extractParts(time);
  if (!parts) return "";

  const { year: years, day: days, hour: hours, minute: minutes } = parts;
  if (years || days) return "";
  if (hours && minutes) {
    return _formatRemainingHoursAndMinutes({ hours, minutes, t, formatMode });
  }
  if (hours || minutes) {
    return _formatRemainingTimePart({
      timePart: hours ? TimePart.hour : TimePart.minute,
      count: hours || minutes,
      t,
      formatMode,
    });
  }
  const minuteTimePartText = t(`common:timePart.${TimePart.minute}`);
  return t("common:remainingTime.lessThanOneTimePart", {
    timePart: minuteTimePartText,
  });
};

export const TimeUtils = {
  formatModes,
  formatRemainingTime,
  formatRemainingTimeIfLessThan1Day,
  extractParts,
};
