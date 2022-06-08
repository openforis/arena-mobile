const BASE_UUID = 'BASE_UUID-';
const baseCurrent = 1000;
let current = baseCurrent;
const getCurrentUuid = (id = false) => {
  if (id) {
    return `${BASE_UUID}${baseCurrent + id}`;
  }
  current++;
  const uuid = `${BASE_UUID}${current}`;
  return uuid;
};

export default getCurrentUuid;
