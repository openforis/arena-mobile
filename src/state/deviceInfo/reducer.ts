import { StoreUtils } from "../storeUtils";
import { DeviceInfoActions } from "./actions";

const initialState = {};

const actionHandlers = {
  [DeviceInfoActions.DEVICE_INFO_SET]: ({
    action
  }: any) => ({
    ...action.payload,
  }),
  [DeviceInfoActions.DEVICE_INFO_UPDATE]: ({
    state,
    action
  }: any) => ({
    ...state,
    ...action.payload,
  }),
};

export const DeviceInfoReducer = StoreUtils.exportReducer({
  actionHandlers,
  initialState,
});
