import { Functions } from "utils/Functions";

const applyReducerFunction = ({
  actionHandlers,
  action,
  state = {}
}: any) => {
  const actionHandler = actionHandlers[action.type];
  return actionHandler ? actionHandler({ state, action }) : state;
};

const exportReducer =
  ({
    actionHandlers,
    intialState
  }: any) =>
  (state = intialState, action: any) =>
    applyReducerFunction({ actionHandlers, action, state });

export const debounceAction = (action: any, key: any, time = 500) => {
  return Functions.debounce(action, time);
};

export const cancelDebouncedAction = (key: any) => ({
  type: `${key}/cancel`,
  meta: { debounce: { cancel: true, key } }
});

export const StoreUtils = {
  exportReducer,
  debounceAction,
  cancelDebouncedAction,
};
