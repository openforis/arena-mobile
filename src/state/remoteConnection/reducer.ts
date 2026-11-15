import { User } from "@openforis/arena-core";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RemoteConnectionState, UserProfileIconInfo } from "./types";

const initialState: RemoteConnectionState = {
  user: null,
  userLoading: false,
  userProfileIconInfo: { loaded: false, loading: false },
};

const remoteConnectionSlice = createSlice({
  name: "remoteConnection",
  initialState,
  reducers: {
    userLoading: (state, action: PayloadAction<User | null | undefined>) => {
      // last logged in user (if any) kept while it's fetched again
      state.user = action.payload ?? null;
      state.userLoading = true;
    },
    userSet: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.userLoading = false;
    },
    userProfileIconInfoSet: (
      state,
      action: PayloadAction<UserProfileIconInfo | null>,
    ) => {
      state.userProfileIconInfo = action.payload;
    },
  },
});

export const RemoteConnectionSliceActions = remoteConnectionSlice.actions;
export const RemoteConnectionReducer = remoteConnectionSlice.reducer;
