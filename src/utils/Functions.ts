import debounce from "lodash.debounce";
import throttle from "lodash.throttle";

const identity = (val: any) => val;
const voidFn = () => {};

export const Functions = {
  debounce,
  identity,
  throttle,
  voidFn,
};
