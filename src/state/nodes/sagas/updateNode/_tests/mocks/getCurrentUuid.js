const BASE_UUID = 'BASE_UUID-';
const baseCurrent = 1000;
let current = baseCurrent;

export const getCurrentUuid = (id = false) => {
  if (id) {
    return `${BASE_UUID}${baseCurrent + id}`;
  }
  current++;
  return `${BASE_UUID}${current}`;
};
export default getCurrentUuid;
