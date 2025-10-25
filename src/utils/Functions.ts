import debounce from "lodash.debounce";
import throttle from "lodash.throttle";

const identity = (val: any) => val;

export const Functions = {
  debounce,
  identity,
  throttle,
};
