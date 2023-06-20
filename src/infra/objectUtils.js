import {Objects as _Objects} from '@openforis/arena-core';

export const deleteValueByKey =
  ({conditionToDelete = () => false}) =>
  obj => {
    let newObject = Object.assign({}, obj);
    (Object.keys(obj) || []).forEach(key => {
      const item = obj[key];
      if (conditionToDelete(item)) {
        delete newObject[key];
      }
    });
    return newObject;
  };

export const mergeSpread = (obj, newObj) => ({...obj, ...newObj});
export const mergeShallow = (obj, newObj) => Object.assign({}, obj, newObj);
export const mergeNoSpread = (obj, newObj) => {
  const result = Object.assign({}, obj);
  Object.keys(newObj).forEach(key => {
    result[key] = newObj[key];
  });
  return result;
};

export const Objects = _Objects;
