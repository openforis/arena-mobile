import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { ScreenViewMode } from "model/ScreenViewMode";
import { screenKeys } from "screens/screenKeys";

import { ScreenOptionsState } from "./state";

// surveys lists are short: cards are nicer there
const initialState = [
  screenKeys.surveysListLocal,
  screenKeys.surveysListRemote,
].reduce(
  (acc, screenKey) =>
    ScreenOptionsState.assocViewMode({
      screenKey,
      viewMode: ScreenViewMode.cards,
    })(acc),
  {} as ScreenOptionsState,
);

const screenOptionsSlice = createSlice({
  name: "screenOptions",
  initialState,
  reducers: {
    setViewMode: (
      state,
      action: PayloadAction<{ screenKey: string; viewMode: ScreenViewMode }>,
    ) => {
      const { screenKey, viewMode } = action.payload;
      state[screenKey] = { ...state[screenKey], viewMode };
    },
  },
});

export const ScreenOptionsSliceActions = screenOptionsSlice.actions;
export const ScreenOptionsReducer = screenOptionsSlice.reducer;
