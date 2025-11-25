export enum Sort {
  asc = "ascending",
  desc = "descending",
}

export type SortObject = Record<string, Sort>;

const getNextSortDirection = (sortPrev: Sort | undefined) => {
  if (!sortPrev) return Sort.asc;
  if (sortPrev === Sort.asc) return Sort.desc;
  return undefined;
};

export const SortUtils = {
  getNextSortDirection,
};
