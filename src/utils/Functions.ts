// @ts-expect-error TS(7016): Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import debounce from "lodash.debounce";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import throttle from "lodash.throttle";

const identity = (val: any) => val;

export const Functions = {
  debounce,
  identity,
  throttle,
};
