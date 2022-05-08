export const isNil = val => val === undefined || val === null;

export const isNull = val => val == null;

export const isEmpty = value => {
  if (isNull(value)) {
    return true;
  }

  if (value.constructor === Object) {
    return Object.keys(value).length === 0;
  }
  if (value.constructor === Array) {
    return value.length === 0;
  }
  if (value.constructor === String) {
    return value.length === 0;
  }
  if (value.constructor === Set) {
    return value.size === 0;
  }
  if (value.constructor === Map) {
    return value.size === 0;
  }

  return false;
};
