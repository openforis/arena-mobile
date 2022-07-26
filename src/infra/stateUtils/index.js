export const normalizeByUuid = arr => {
  const result = {};
  arr.forEach(element => {
    result[element.uuid] = element;
  });
  return result;
};

// cached keys
const stringKey = (_, uuid) => uuid || '_';
const itemUuidKey = (_, item) => item?.uuid || '_';

export const keySelectors = {
  stringKey,
  itemUuidKey,
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

const perfEnd = (label = '*') => {
  if (!__DEV__) {
    return;
  }
  console.log(label, ':', new Date() - timmers[label], 'ms');
  delete timmers[label];
  return;
};

export const perfState = {
  start: perfStart,
  end: perfEnd,
};
