import { StoreUtils } from "../storeUtils";
import { RemoteConnectionActions } from "./actions";

const initialState = {
  user: null,
  userProfileIconInfo: { loaded: false, loading: false, uri: null },
};

const actionHandlers = {
  [RemoteConnectionActions.USER_SET]: ({ state, action }) => ({
    ...state,
    user: action.user,
  }),
  [RemoteConnectionActions.USER_PROFILE_ICON_INFO_SET]: ({
    state,
    action,
  }) => ({
    ...state,
    userProfileIconInfo: action.payload,
  }),
  [RemoteConnectionActions.LOGGED_OUT]: () => ({
    ...initialState,
  }),
};

export const RemoteConnectionReducer = StoreUtils.exportReducer({
  actionHandlers,
  initialState,
});
