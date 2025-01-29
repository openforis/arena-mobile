import { StoreUtils } from "../storeUtils";
import { SettingsActions } from "./actions";

const actionHandlers = {
  [SettingsActions.SETTINGS_SET]: ({ state, action }) => ({
    ...state,
    ...action.settings,
  }),
};

export const SettingsReducer = StoreUtils.exportReducer({
  actionHandlers,
  initialState: false,
});
