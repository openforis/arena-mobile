import {Objects as _Objects} from '@openforis/arena-core';

export const deleteValueByKey =
  ({conditionToDelete = () => false}) =>
  obj => {
    let newObject = {...obj};
    (Object.keys(obj) || []).forEach(key => {
      const item = obj[key];
      if (conditionToDelete(item)) {
        delete newObject[key];
      }
    });
    return newObject;
  };

export const mergeSpread = (obj, newObj) => ({...obj, ...newObj});
export const mergeNoSpread = (obj, newObj) => {
  if (Objects.isEmpty(newObj)) return obj;
  if (Objects.isEmpty(obj)) return newObj;

  const result = {...obj};

  Object.keys(newObj).forEach(key => {
    result[key] = newObj[key];
  });
  return result;
};

export const eqSet = (xs, ys) =>
  xs.size === ys.size && [...xs].every(x => ys.has(x));

export const compareArraysAsSets = (arrA, arrB) => {
  const setA = new Set([...(arrA || [])]);
  const setB = new Set([...(arrB || [])]);
  return eqSet(setA, setB);
};
export const Objects = _Objects;
