import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { SettingsObject } from "model/SettingsModel";

// filled by AppInitializer before the app screens render
const initialState = {} as SettingsObject;

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    set: (state, action: PayloadAction<Partial<SettingsObject>>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const SettingsSliceActions = settingsSlice.actions;
export const SettingsReducer = settingsSlice.reducer;
