export const normalizeByUuid = arr => {
  const result = {};
  arr.forEach(element => {
    result[element.uuid] = element;
  });
  return result;
};

export const DEFAULT_NO_KEY = '_';
// cached keys
const identity = (_, item) => item;
const stringKey = (_, uuid) => uuid || DEFAULT_NO_KEY;
const getUuidFromItem = (_, item) => item?.uuid || DEFAULT_NO_KEY;
const mapItemsUuid = (_, items) =>
  items?.map(item => item.uuid).join('_') || DEFAULT_NO_KEY;

export const keySelectors = {
  identity,
  stringKey,
  getUuidFromItem,
  mapItemsUuid,
  nodeUuid: stringKey,
  recordUuid: stringKey,
  surveyUuid: stringKey,
};

// Performance
let timmers = {};
const perfStart = (label = '*') => {
  if (!__DEV__) {
    return;
  }
  timmers[label] = new Date();
};

const exists = (label = '*') => {
  if (!__DEV__) {
    return;
  }
  return timmers[label] !== undefined;
};

const perfEnd = (label = '*') => {
  if (!__DEV__) {
    return;
  }
  console.log(label, ':', new Date() - timmers[label], 'ms');
  delete timmers[label];
};

export const perfState = {
  start: perfStart,
  end: perfEnd,
  exists,
};

export const EMPTY_OBJECT = {};
