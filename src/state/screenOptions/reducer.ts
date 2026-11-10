import { ScreenViewMode } from "model/ScreenViewMode";
import { screenKeys } from "screens/screenKeys";

import { ActionHandlers, StoreUtils } from "../storeUtils";

import { ScreenOptionsActions } from "./actions";
import { ScreenOptionsState } from "./state";

// surveys lists are short: cards are nicer there
const initialState = [
  screenKeys.surveysListLocal,
  screenKeys.surveysListRemote,
].reduce(
  (acc, screenKey) =>
    ScreenOptionsState.assocViewMode({
      screenKey,
      viewMode: ScreenViewMode.cards,
    })(acc),
  {} as ScreenOptionsState,
);

const actionHandlers: ActionHandlers<ScreenOptionsState> = {
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
