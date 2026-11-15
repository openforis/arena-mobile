import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { DeviceInfoState } from "./types";

// filled by AppInitializer before the app screens render
const initialState = {} as DeviceInfoState;

const deviceInfoSlice = createSlice({
  name: "deviceInfo",
  initialState,
  reducers: {
    set: (_state, action: PayloadAction<DeviceInfoState>) => ({
      ...action.payload,
    }),
    update: (state, action: PayloadAction<Partial<DeviceInfoState>>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const DeviceInfoSliceActions = deviceInfoSlice.actions;
export const DeviceInfoReducer = deviceInfoSlice.reducer;
