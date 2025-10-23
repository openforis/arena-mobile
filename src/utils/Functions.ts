import debounce from "lodash.debounce";
import throttle from "lodash.throttle";

const identity = (val) => val;

export const Functions = {
  debounce,
  identity,
  throttle,
};
