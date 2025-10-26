import debounce from "lodash.debounce";
import throttle from "lodash.throttle";

const identity = <T>(val: T): T => val;
const voidFn = (): void => {};

export const Functions = {
  debounce,
  identity,
  throttle,
  voidFn,
};
