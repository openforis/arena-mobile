import { ActionHandlers, StoreUtils } from "../storeUtils";
import { DeviceInfoActions } from "./actions";
import type { DeviceInfoState } from "./types";

// filled by AppInitializer before the app screens render
const initialState = {} as DeviceInfoState;

const actionHandlers: ActionHandlers<DeviceInfoState> = {
  [DeviceInfoActions.DEVICE_INFO_SET]: ({ action }) => ({
    ...action.payload,
  }),
  [DeviceInfoActions.DEVICE_INFO_UPDATE]: ({ state, action }) => ({
    ...state,
    ...action.payload,
  }),
};

export const DeviceInfoReducer = StoreUtils.exportReducer({
  actionHandlers,
  initialState,
});
