import { SettingsObject } from "model/SettingsModel";

import { ActionHandlers, StoreUtils } from "../storeUtils";
import { SettingsActions } from "./actions";

// filled by AppInitializer before the app screens render
const initialState = {} as SettingsObject;

const actionHandlers: ActionHandlers<SettingsObject> = {
  [SettingsActions.SETTINGS_SET]: ({ state, action }) => ({
    ...state,
    ...action.settings,
  }),
};

export const SettingsReducer = StoreUtils.exportReducer({
  actionHandlers,
  initialState,
});
