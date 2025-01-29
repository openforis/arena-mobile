import { StoreUtils } from "../storeUtils";

import { ScreenOptionsActions } from "./actions";
import { ScreenOptionsState } from "./state";

const initialState = {
  [ScreenOptionsState.keys.viewMode]: {},
};

const actionHandlers = {
  [ScreenOptionsActions.SCREEN_VIEW_MODE_SET]: ({ state, action }) =>
    ScreenOptionsState.assocViewMode({
      screenKey: action.screenKey,
      viewMode: action.viewMode,
    })(state),
};

export const ScreenOptionsReducer = StoreUtils.exportReducer({
  actionHandlers,
  initialState,
});
