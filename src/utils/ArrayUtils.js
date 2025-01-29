import { DateFormats, Dates, Objects } from "@openforis/arena-core";

const determineDateFormat = (
  value,
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

const findByUuid = (uuid) => (array) =>
  array.find((item) => item.uuid === uuid);

const sortCompareFn = (sortProp, sortDirection) => (itemA, itemB) => {
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
      return (dateA - dateB) * sortDirectionFactor;
    }
    return propA.localeCompare(propB) * sortDirectionFactor;
  }
  return (propA - propB) * sortDirectionFactor;
};

const sortByProp =
  (sortProp, sortDirection = "ascending") =>
  (array) => {
    array.sort(sortCompareFn(sortProp, sortDirection));
  };

const sortByProps = (sortObj) => (array) => {
  array.sort((itemA, itemB) => {
    let sortResult = 0;
    Object.entries(sortObj).some(([sortProp, sortDirection]) => {
      sortResult = sortCompareFn(sortProp, sortDirection)(itemA, itemB);
      return sortResult !== 0;
    });
    return sortResult;
  });
};

const indexByUuid = (array) =>
  array.reduce((acc, item) => {
    acc[item.uuid] = item;
    return acc;
  }, {});

export const ArrayUtils = {
  findByUuid,
  sortByProp,
  sortByProps,
  indexByUuid,
};
