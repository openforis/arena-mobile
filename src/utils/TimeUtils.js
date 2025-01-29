const msInOneSecond = 1000;
const msInOneMinute = 60 * msInOneSecond;
const msInOneHour = msInOneMinute * 60;
const msInOneDay = msInOneHour * 24;
const msInOneYear = msInOneDay * 365;

const timeParts = {
  year: "year",
  day: "day",
  hour: "hour",
  minute: "minute",
  second: "second",
};

const msPerTimePart = {
  [timeParts.year]: msInOneYear,
  [timeParts.day]: msInOneDay,
  [timeParts.hour]: msInOneHour,
  [timeParts.minute]: msInOneMinute,
  [timeParts.second]: msInOneSecond,
};

const formatModes = {
  full: "full",
  compact: "compact",
  short: "short",
};

const _calculateValuePerTimePart = (time, part) => {
  const timePartsValues = Object.values(timeParts);
  const prevTimePart = timePartsValues[timePartsValues.indexOf(part) - 1];
  const timeEffective = prevTimePart
    ? time % msPerTimePart[prevTimePart]
    : time;
  return Math.floor(timeEffective / msPerTimePart[part]);
};

const formatRemainingTime = ({ time, upToTimePart = timeParts.minute, t }) => {
  if (!time) return "";

  const timePartsValues = Object.values(timeParts);
  const upToTimePartIndex = timePartsValues.indexOf(upToTimePart);
  const timePartsValuesFiltered = timePartsValues.slice(
    0,
    upToTimePartIndex + 1
  );
  for (const timePart of timePartsValuesFiltered) {
    const value = _calculateValuePerTimePart(time, timePart);
    if (value) {
      const timePartText = t(`common:timePart.${timePart}`, { count: value });
      return t("common:remainingTime", {
        timePart: timePartText,
        count: value,
      });
    }
  }
  const upToTimePartText = t(`common:timePart.${upToTimePart}`);
  return t("common:lessThanOneTimePart", { timePart: upToTimePartText });
};

const extractParts = (time) =>
  !time
    ? null
    : Object.values(timeParts).reduce((acc, timePart) => {
        acc[timePart] = _calculateValuePerTimePart(time, timePart);
        return acc;
      }, {});

const _formatRemainingHoursAndMinutes = ({ hours, minutes, t, formatMode }) => {
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

const _formatRemainingTimePart = ({ timePart, count, t, formatMode }) => {
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
}) => {
  const parts = extractParts(time);
  if (!parts) return "";

  const { year: years, day: days, hour: hours, minute: minutes } = parts;
  if (years || days) return "";
  if (hours && minutes) {
    return _formatRemainingHoursAndMinutes({ hours, minutes, t, formatMode });
  }
  if (hours || minutes) {
    return _formatRemainingTimePart({
      timePart: hours ? timeParts.hour : timeParts.minute,
      count: hours || minutes,
      t,
      formatMode,
    });
  }
  const minuteTimePartText = t(`common:timePart.${timeParts.minute}`);
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
