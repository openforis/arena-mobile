export const SORTERS_KEYS = {
  dateModified: 'dateModified',
  name: 'name',
};
export const SORTERS_DIRECTION = {asc: 'asc', desc: 'desc'};

const DATE_MODIFIED_ASC = {
  type: SORTERS_KEYS.dateModified,
  direction: SORTERS_DIRECTION.asc,
  icon: 'sort-calendar-ascending',
};
const DATE_MODIFIED_DESC = {
  type: SORTERS_KEYS.dateModified,
  direction: SORTERS_DIRECTION.desc,
  icon: 'sort-calendar-descending',
};

const NAME_ASC = {
  type: SORTERS_KEYS.name,
  direction: SORTERS_DIRECTION.asc,
  icon: 'sort-alphabetical-ascending',
};
const NAME_DESC = {
  type: SORTERS_KEYS.name,
  direction: SORTERS_DIRECTION.desc,
  icon: 'sort-alphabetical-descending',
};

export const SORTERS = [
  DATE_MODIFIED_ASC,
  DATE_MODIFIED_DESC,
  NAME_ASC,
  NAME_DESC,
];
