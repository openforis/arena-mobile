import { DateFormats, Dates, Objects } from "@openforis/arena-core";

import { Sort, SortObject } from "model/Sort";

// length of the values written in the format: text in [...] is a literal, written without the brackets
const formattedValueLength = (format: string): number =>
  format.replaceAll("[", "").replaceAll("]", "").length;

const determineDateFormat = (
  value: string,
  dateFormats = [
    DateFormats.dateDisplay,
    DateFormats.datetimeDisplay,
    DateFormats.datetimeDefault,
    DateFormats.dateStorage,
    DateFormats.datetimeStorage,
  ],
) =>
  dateFormats.find(
    (format) =>
      value.length === formattedValueLength(format) &&
      Dates.isValidDateInFormat(value, format),
  );

/**
 * Helper to determine the factor based on sort direction
 */
const getSortFactor = (sortDirection: Sort): 1 | -1 =>
  sortDirection === Sort.asc ? 1 : -1;

/**
 * Helper to safely get the timestamp or 0
 */
const getTimeSafely = (date: Date | undefined): number =>
  date instanceof Date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;

/**
 * Compares two property values (propA and propB) based on their type.
 * Handles string, number, and date comparisons.
 */
const compareValues = (propA: unknown, propB: unknown): number => {
  // --- Date Comparison ---
  if (typeof propA === "string" && typeof propB === "string") {
    const dateFormat = determineDateFormat(propA);

    if (dateFormat) {
      const dateA = Dates.parse(propA, dateFormat);
      const dateB = Dates.parse(propB, dateFormat);

      const timeA = getTimeSafely(dateA);
      const timeB = getTimeSafely(dateB);

      return timeA - timeB;
    }
    // --- String Comparison (non-date) ---
    return propA.localeCompare(propB);
  }
  // --- Numeric/Default Comparison ---
  return (propA as number) - (propB as number);
};

/**
 * Returns a comparison function suitable for Array.prototype.sort().
 * It handles property access, empty/null values, and delegates value comparison.
 */
const sortCompareFn =
  (sortProp: string, sortDirection: Sort) =>
  (itemA: object, itemB: object): number => {
    const sortPropPath = sortProp?.split(".");
    const propA = Objects.path<unknown>(sortPropPath)(itemA);
    const propB = Objects.path<unknown>(sortPropPath)(itemB);

    const sortDirectionFactor = getSortFactor(sortDirection);

    const emptyA = Objects.isEmpty(propA);
    const emptyB = Objects.isEmpty(propB);

    // 1. Handle Empty Values First
    if (emptyA && emptyB) return 0;
    // Empty comes after non-empty when ascending (1 * factor)
    // and before non-empty when descending (-1 * factor)
    if (emptyA) return 1 * sortDirectionFactor;
    if (emptyB) return -1 * sortDirectionFactor;

    // 2. Delegate Comparison
    const comparisonResult = compareValues(propA, propB);

    // 3. Apply Sort Direction
    return comparisonResult * sortDirectionFactor;
  };

type ItemWithUuid = { uuid: string };

const findByUuid =
  (uuid: string) =>
  <T extends ItemWithUuid>(array: T[]): T | undefined =>
    array.find((item) => item.uuid === uuid);

const sortByProps =
  (sortObj: SortObject) =>
  <T extends object>(array: T[]): void => {
    array.sort((itemA, itemB) => {
      let sortResult = 0;
      Object.entries(sortObj).some(([sortProp, sortDirection]) => {
        sortResult = sortCompareFn(sortProp, sortDirection)(itemA, itemB);
        return sortResult !== 0;
      });
      return sortResult;
    });
  };

// loosely typed values: some callers rely on them (e.g. RecordSummary.dateModified)
const indexByUuid = <T extends ItemWithUuid>(array: T[]): Record<string, any> =>
  array.reduce(
    (acc, item) => {
      acc[item.uuid] = item;
      return acc;
    },
    {} as Record<string, T>,
  );

// adds the item if missing, removes it otherwise
const toggleItem = <T>(array: T[], item: T): T[] =>
  array.includes(item) ? array.filter((i) => i !== item) : [...array, item];

export const ArrayUtils = {
  determineDateFormat,
  findByUuid,
  toggleItem,
  sortByProps,
  indexByUuid,
};
