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
