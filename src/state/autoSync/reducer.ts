import { StoreUtils } from "../storeUtils";

import { AutoSyncActions } from "./actions";
import { AutoSyncState, AutoSyncStatus } from "./types";

const initialState: AutoSyncState = {
  checking: false,
  lastCheckedAt: null,
  status: AutoSyncStatus.unchecked,
  message: null,
};

const actionHandlers = {
  [AutoSyncActions.AUTO_SYNC_CHECK_START]: ({ state }: any) => ({
    ...state,
    checking: true,
    message: null,
  }),
  [AutoSyncActions.AUTO_SYNC_CHECK_END]: ({ state, action }: any) => ({
    ...state,
    ...action.payload,
    checking: false,
  }),
  [AutoSyncActions.AUTO_SYNC_CHECK_ABORTED]: ({ state }: any) => ({
    ...state,
    checking: false,
  }),
  [AutoSyncActions.AUTO_SYNC_AUTH_ERROR]: ({ state, action }: any) => ({
    ...state,
    ...action.payload,
    checking: false,
  }),
  [AutoSyncActions.AUTO_SYNC_CHECK_ERROR]: ({ state, action }: any) => ({
    ...state,
    ...action.payload,
    checking: false,
  }),
  [AutoSyncActions.AUTO_SYNC_RESET]: () => ({
    ...initialState,
  }),
  [AutoSyncActions.AUTO_SYNC_STATUS_MESSAGE_SET]: ({ state, action }: any) => ({
    ...state,
    ...action.payload,
  }),
  [AutoSyncActions.AUTO_SYNC_STATUS_MARKED_PENDING]: ({ state, action }: any) => ({
    ...state,
    ...action.payload,
  }),
};

export const AutoSyncReducer = StoreUtils.exportReducer({
  actionHandlers,
  initialState,
});
