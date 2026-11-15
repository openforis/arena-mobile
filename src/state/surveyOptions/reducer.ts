import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RecordEditViewMode } from "model/RecordEditViewMode";
import { SurveyActionTypes } from "../survey/actionTypes";
import { SurveyOptionsState } from "./state";

const initialState: SurveyOptionsState = {
  recordEditViewMode: RecordEditViewMode.form,
};

const surveyOptionsSlice = createSlice({
  name: "surveyOptions",
  initialState,
  reducers: {
    setRecordEditViewMode: (state, action: PayloadAction<string>) => {
      state.recordEditViewMode = action.payload;
    },
    setAllEntityListColumns: (
      state,
      action: PayloadAction<Record<string, string[]> | undefined>,
    ) => {
      state.entityListColumnsByEntityDefUuid = action.payload;
    },
    // columns: null removes the entry (default columns)
    setEntityListColumns: (
      state,
      action: PayloadAction<{
        entityDefUuid: string;
        columns: string[] | null;
      }>,
    ) => {
      const { entityDefUuid, columns } = action.payload;
      if (columns) {
        state.entityListColumnsByEntityDefUuid ??= {};
        state.entityListColumnsByEntityDefUuid[entityDefUuid] = columns;
        return;
      }
      const columnsByEntityDefUuid = state.entityListColumnsByEntityDefUuid;
      if (!columnsByEntityDefUuid) return;
      delete columnsByEntityDefUuid[entityDefUuid];
      if (Object.keys(columnsByEntityDefUuid).length === 0) {
        delete state.entityListColumnsByEntityDefUuid;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(SurveyActionTypes.CURRENT_SURVEY_SET, () => ({
      ...initialState,
    }));
  },
});

export const SurveyOptionsSliceActions = surveyOptionsSlice.actions;
export const SurveyOptionsReducer = surveyOptionsSlice.reducer;
