import moment from 'moment';

const SORTERS_KEYS = {
  dateModified: 'dateModified',
  name: 'name',
};
const SORTERS_DIRECTION = {asc: 'asc', desc: 'desc'};

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

export const SORT_FUNCTIONS_BY_TYPE = {
  [SORTERS_KEYS.dateModified]: sortCriteria => (sa, sb) =>
    moment(sa.dateModified).diff(moment(sb.dateModified)) *
    (sortCriteria?.direction === SORTERS_DIRECTION.asc ? -1 : 1),
  [SORTERS_KEYS.name]: sortCriteria => (sa, sb) =>
    (sa?.props?.name > sb?.props?.name ? -1 : 1) *
    (sortCriteria?.direction === SORTERS_DIRECTION.asc ? -1 : 1),
};
