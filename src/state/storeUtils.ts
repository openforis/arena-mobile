import { Functions } from "utils/Functions";

const applyReducerFunction = ({ actionHandlers, action, state = {} }) => {
  const actionHandler = actionHandlers[action.type];
  return actionHandler ? actionHandler({ state, action }) : state;
};

const exportReducer =
  ({ actionHandlers, intialState }) =>
  (state = intialState, action) =>
    applyReducerFunction({ actionHandlers, action, state });

export const debounceAction = (action, key, time = 500) => {
  return Functions.debounce(action, time);
};

export const cancelDebouncedAction = (key) => ({
  type: `${key}/cancel`,
  meta: { debounce: { cancel: true, key } },
});

export const StoreUtils = {
  exportReducer,
  debounceAction,
  cancelDebouncedAction,
};
