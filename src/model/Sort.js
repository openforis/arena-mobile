const asc = "ascending";
const desc = "descending";

const getNextSortDirection = (sortPrev) => {
  if (!sortPrev) return asc;
  if (sortPrev === asc) return desc;
  return undefined;
};

export const SortDirection = {
  asc,
  desc,
  getNextSortDirection,
};
