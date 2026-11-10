import { ActionHandlers, StoreUtils } from "../storeUtils";
import { RemoteConnectionActions } from "./actions";
import { RemoteConnectionState } from "./types";

const initialState: RemoteConnectionState = {
  user: null,
  userLoading: false,
  userProfileIconInfo: { loaded: false, loading: false },
};

const actionHandlers: ActionHandlers<RemoteConnectionState> = {
  [RemoteConnectionActions.USER_LOADING]: ({ state }) => ({
    ...state,
    user: null,
    userLoading: true,
  }),
  [RemoteConnectionActions.USER_SET]: ({ state, action }) => ({
    ...state,
    user: action.user,
    userLoading: false,
  }),
  [RemoteConnectionActions.USER_PROFILE_ICON_INFO_SET]: ({
    state,
    action,
  }) => ({
    ...state,
    userProfileIconInfo: action.payload,
  }),
};

export const RemoteConnectionReducer = StoreUtils.exportReducer({
  actionHandlers,
  initialState,
});
