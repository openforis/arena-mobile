import { Functions } from "utils/Functions";

type ActionHandler<S> = (params: { state: S; action: any }) => S;

export type ActionHandlers<S> = Record<string, ActionHandler<S>>;

// the state type is inferred from initialState only: handlers returning any must not widen it
const exportReducer =
  <S>({
    actionHandlers,
    initialState,
  }: {
    actionHandlers: ActionHandlers<NoInfer<S>>;
    initialState: S;
  }) =>
  (state: S = initialState, action: any): S => {
    const actionHandler = actionHandlers[action.type];
    return actionHandler ? actionHandler({ state, action }) : state;
  };

export const debounceAction = (action: any, time = 500) =>
  Functions.debounce(action, time);

export const StoreUtils = {
  exportReducer,
  debounceAction,
};
