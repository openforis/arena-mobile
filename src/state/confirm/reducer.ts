import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Keyboard } from "react-native";

const initialState = {
  isOpen: false,
};

// confirm and cancel as async thunk to allow calling "dispatch" inside onConfirm and onCancel
const confirm = createAsyncThunk(
  "confirm/show",
  async (params, { getState }) => {
    // @ts-expect-error TS(2339): Property 'selectedMultipleChoiceValues' does not e... Remove this comment to see the full error message
    const { selectedMultipleChoiceValues, selectedSingleChoiceValue } = params;
    const state = getState();
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const { onConfirm } = state.confirm;
    await onConfirm?.({
      selectedMultipleChoiceValues,
      selectedSingleChoiceValue,
    });
  }
);

const cancel = createAsyncThunk(
  "confirm/cancel",
  async (_params, { getState }) => {
    const state = getState();
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const { onCancel } = state.confirm;
    await onCancel?.();
  }
);

const confirmSlice = createSlice({
  name: "confirm",
  initialState,
  reducers: {
    show: (_state, action) => {
      Keyboard.dismiss();
      return { ...action.payload, isOpen: true };
    },
    dismiss: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(confirm.fulfilled, () => initialState)
      .addCase(cancel.fulfilled, () => initialState);
  },
});

const { actions, reducer: ConfirmReducer } = confirmSlice;
const { show, dismiss } = actions;

export const ConfirmActions = {
  show: ({
    titleKey = "common:confirm",
    cancelButtonStyle = undefined,
    cancelButtonTextKey = "common:cancel",
    confirmButtonStyle = undefined,
    confirmButtonTextKey = "common:confirm",
    messageKey,
    messageParams = {},
    multipleChoiceOptions = [],
    onConfirm,
    onCancel = undefined,
    singleChoiceOptions = [],
    defaultMultipleChoiceValues = [],
    defaultSingleChoiceValue = null,
    swipeToConfirm = false,
    swipeToConfirmTitleKey = "common:swipeToConfirm"
  }: any) =>
    show({
      titleKey,
      cancelButtonStyle,
      cancelButtonTextKey,
      confirmButtonStyle,
      confirmButtonTextKey,
      messageKey,
      messageParams,
      multipleChoiceOptions,
      onConfirm,
      onCancel,
      singleChoiceOptions,
      defaultMultipleChoiceValues,
      defaultSingleChoiceValue,
      swipeToConfirm,
      swipeToConfirmTitleKey,
    }),
  dismiss,

  // internal (called from dialog component)
  confirm: ({
    selectedMultipleChoiceValues,
    selectedSingleChoiceValue
  }: any) =>
    // @ts-expect-error TS(2345): Argument of type '{ selectedMultipleChoiceValues: ... Remove this comment to see the full error message
    confirm({ selectedMultipleChoiceValues, selectedSingleChoiceValue }),
  cancel,
};
export { ConfirmReducer };
