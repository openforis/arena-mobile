import { StoreUtils } from "../storeUtils";
import { RemoteConnectionActions } from "./actions";

const initialState = {
  user: null,
  userLoading: false,
  userProfileIconInfo: { loaded: false, loading: false, uri: null },
};

const actionHandlers = {
  [RemoteConnectionActions.USER_LOADING]: ({
    state
  }: any) => ({
    ...state,
    user: null,
    userLoading: true,
  }),
  [RemoteConnectionActions.USER_SET]: ({
    state,
    action
  }: any) => ({
    ...state,
    user: action.user,
    userLoading: false,
  }),
  [RemoteConnectionActions.USER_PROFILE_ICON_INFO_SET]: ({
    state,
    action
  }: any) => ({
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
