import { DateFormats, Dates, Objects } from "@openforis/arena-core";

import { Sort, SortObject } from "model/Sort";

const determineDateFormat = (
  value: any,
  dateFormats = [
    DateFormats.dateDisplay,
    DateFormats.datetimeDisplay,
    DateFormats.datetimeDefault,
    DateFormats.dateStorage,
    DateFormats.datetimeStorage,
  ]
) =>
  dateFormats.find(
    (format) =>
      value.length === format.length && Dates.isValidDateInFormat(value, format)
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
const compareValues = (propA: any, propB: any): number => {
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
  return propA - propB;
};

/**
 * Returns a comparison function suitable for Array.prototype.sort().
 * It handles property access, empty/null values, and delegates value comparison.
 */
const sortCompareFn =
  (sortProp: string, sortDirection: Sort) =>
  (itemA: any, itemB: any): number => {
    const sortPropPath = sortProp?.split(".");
    const propA = Objects.path(sortPropPath)(itemA);
    const propB = Objects.path(sortPropPath)(itemB);
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

const findByUuid = (uuid: any) => (array: any) =>
  array.find((item: any) => item.uuid === uuid);

const sortByProp =
  (sortProp: any, sortDirection: Sort = Sort.asc) =>
  (array: any) => {
    array.sort(sortCompareFn(sortProp, sortDirection));
  };

const sortByProps = (sortObj: SortObject) => (array: any) => {
  array.sort((itemA: any, itemB: any) => {
    let sortResult = 0;
    Object.entries(sortObj).some(([sortProp, sortDirection]) => {
      sortResult = sortCompareFn(sortProp, sortDirection)(itemA, itemB);
      return sortResult !== 0;
    });
    return sortResult;
  });
};

const indexByUuid = (array: any) =>
  array.reduce((acc: any, item: any) => {
    acc[item.uuid] = item;
    return acc;
  }, {});

export const ArrayUtils = {
  findByUuid,
  sortByProp,
  sortByProps,
  indexByUuid,
};
