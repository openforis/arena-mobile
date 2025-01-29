import { StoreUtils } from "../storeUtils";
import { DeviceInfoActions } from "./actions";

const initialState = {};

const actionHandlers = {
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
