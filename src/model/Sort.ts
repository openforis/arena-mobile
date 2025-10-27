export enum Sort {
  asc = "ascending",
  desc = "descending",
}

const getNextSortDirection = (sortPrev: Sort) => {
  if (!sortPrev) return Sort.asc;
  if (sortPrev === Sort.asc) return Sort.desc;
  return undefined;
};

export const SortUtils = {
  getNextSortDirection,
};
