import { Dates } from "@openforis/arena-core";

export type DateTimeInputMode = "date" | "time" | "datetime";

// same formats used by the app to display dates (DD/MM/YYYY) and times (24h HH:mm)
const placeholderByMode: Record<DateTimeInputMode, string> = {
  date: "DD/MM/YYYY",
  time: "HH:mm",
  datetime: "DD/MM/YYYY HH:mm",
};

// position of the separators in the digits typed by the user
const separatorsByMode: Record<DateTimeInputMode, [number, string][]> = {
  date: [
    [2, "/"],
    [4, "/"],
  ],
  time: [[2, ":"]],
  datetime: [
    [2, "/"],
    [4, "/"],
    [8, " "],
    [10, ":"],
  ],
};

const maxDigitsByMode: Record<DateTimeInputMode, number> = {
  date: 8,
  time: 4,
  datetime: 12,
};

const pad = (value: number) => String(value).padStart(2, "0");

const format = (date: Date, mode: DateTimeInputMode): string => {
  const datePart = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  const timePart = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  if (mode === "date") return datePart;
  if (mode === "time") return timePart;
  return `${datePart} ${timePart}`;
};

// keeps only the digits and inserts the separators while typing
const mask = (text: string, mode: DateTimeInputMode): string => {
  const digits = text.replaceAll(/\D/g, "").slice(0, maxDigitsByMode[mode]);
  let result = "";
  for (let index = 0; index < digits.length; index++) {
    const separator = separatorsByMode[mode].find(
      ([position]) => position === index,
    );
    if (separator) result += separator[1];
    result += digits[index];
  }
  return result;
};

const parseDatePart = (datePart: string | undefined, result: Date): boolean => {
  const match = datePart?.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return false;
  const [, day, month, year] = match;
  if (!Dates.isValidDate(year, month, day)) return false;
  result.setFullYear(Number(year), Number(month) - 1, Number(day));
  return true;
};

const parseTimePart = (timePart: string | undefined, result: Date): boolean => {
  const match = timePart?.match(/^(\d{2}):(\d{2})$/);
  if (!match) return false;
  const [, hours, minutes] = match;
  if (!Dates.isValidTime(hours, minutes)) return false;
  result.setHours(Number(hours), Number(minutes), 0, 0);
  return true;
};

// parses the text typed by the user; the parts not in the input (e.g. the time for a date) are taken from dateInitial
const parse = (
  text: string,
  mode: DateTimeInputMode,
  dateInitial: Date,
): Date | null => {
  const result = new Date(dateInitial);
  const [first, second] = text.trim().split(" ");
  const valid =
    mode === "time"
      ? parseTimePart(first, result)
      : parseDatePart(first, result) &&
        (mode === "date" || parseTimePart(second, result));
  return valid ? result : null;
};

export const DateTimeInputFormat = {
  placeholderByMode,
  format,
  mask,
  parse,
};
