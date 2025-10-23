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

const _calculateValuePerTimePart = (time: any, part: any) => {
  const timePartsValues = Object.values(timeParts);
  const prevTimePart = timePartsValues[timePartsValues.indexOf(part) - 1];
  const timeEffective = prevTimePart
    // @ts-expect-error TS(2532): Object is possibly 'undefined'.
    ? time % msPerTimePart[prevTimePart]
    : time;
  // @ts-expect-error TS(2532): Object is possibly 'undefined'.
  return Math.floor(timeEffective / msPerTimePart[part]);
};

const formatRemainingTime = ({
  time,
  upToTimePart = timeParts.minute,
  t
}: any) => {
  if (!time) return "";

  const timePartsValues = Object.values(timeParts);
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

const extractParts = (time: any) => !time
  ? null
  : Object.values(timeParts).reduce((acc, timePart) => {
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      acc[timePart] = _calculateValuePerTimePart(time, timePart);
      return acc;
    }, {});

const _formatRemainingHoursAndMinutes = ({
  hours,
  minutes,
  t,
  formatMode
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

const _formatRemainingTimePart = ({
  timePart,
  count,
  t,
  formatMode
}: any) => {
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
  formatMode = formatModes.full
}: any) => {
  const parts = extractParts(time);
  if (!parts) return "";

  // @ts-expect-error TS(2339): Property 'year' does not exist on type '{}'.
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
