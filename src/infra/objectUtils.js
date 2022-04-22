export const deleteValueByKey =
  ({key = 'uuid', conditionToDelete = () => false}) =>
  obj => {
    let newObject = {...obj};
    (Object.values(obj) || []).forEach(item => {
      if (conditionToDelete(item)) {
        delete newObject[item[key]];
      }
    });
    return newObject;
  };
