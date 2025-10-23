import { DateFormats, Dates, Objects } from "@openforis/arena-core";

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

const findByUuid = (uuid: string) => (array: any[]) =>
  array.find((item: any) => item.uuid === uuid);

const sortCompareFn =
  (sortProp: any, sortDirection: any) => (itemA: any, itemB: any) => {
    const sortDirectionFactor = sortDirection === "ascending" ? 1 : -1;
    const propA = itemA[sortProp];
    const propB = itemB[sortProp];
    const emptyA = Objects.isEmpty(propA);
    const emptyB = Objects.isEmpty(propB);
    if (emptyA && emptyB) return 0;
    if (emptyA) return -1 * sortDirectionFactor;
    if (emptyB) return 1 * sortDirectionFactor;

    if (typeof propA === "string" && typeof propB === "string") {
      const dateFormat = determineDateFormat(propA);
      if (dateFormat) {
        const dateA = Dates.parse(propA, dateFormat);
        const dateB = Dates.parse(propB, dateFormat);
        // @ts-expect-error TS(2362): The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
        return (dateA - dateB) * sortDirectionFactor;
      }
      return propA.localeCompare(propB) * sortDirectionFactor;
    }
    return (propA - propB) * sortDirectionFactor;
  };

const sortByProp =
  (sortProp: any, sortDirection = "ascending") =>
  (array: any[]) => {
    array.sort(sortCompareFn(sortProp, sortDirection));
  };

const sortByProps = (sortObj: any) => (array: any[]) => {
  array.sort((itemA: any, itemB: any) => {
    let sortResult = 0;
    Object.entries(sortObj).some(([sortProp, sortDirection]) => {
      sortResult = sortCompareFn(sortProp, sortDirection)(itemA, itemB);
      return sortResult !== 0;
    });
    return sortResult;
  });
};

const indexByUuid = (array: any[]) =>
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
