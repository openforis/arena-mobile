import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Keyboard } from "react-native";

const initialState = {
  isOpen: false,
};

// confirm and cancel as async thunk to allow calling "dispatch" inside onConfirm and onCancel
const confirm = createAsyncThunk(
  "confirm/show",
  async (params: any, { getState }) => {
    const { selectedMultipleChoiceValues, selectedSingleChoiceValue } = params;
    const state: any = getState();
    const { onConfirm } = state.confirm;
    await onConfirm?.({
      selectedMultipleChoiceValues,
      selectedSingleChoiceValue,
    });
  },
);

const cancel = createAsyncThunk(
  "confirm/cancel",
  async (_params, { getState }) => {
    const state: any = getState();
    const { onCancel } = state.confirm;
    await onCancel?.();
  },
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

export type OnConfirmParams = {
  selectedMultipleChoiceValues?: string[];
  selectedSingleChoiceValue?: string | null;
};

type ChoiceOption = { label: string; value: string };

export type ConfirmShowParams = {
  titleKey?: string;
  cancelButtonStyle?: any;
  cancelButtonTextKey?: string;
  confirmButtonStyle?: any;
  confirmButtonTextKey?: string;
  messageKey?: string;
  messageParams?: any;
  multipleChoiceOptions?: ChoiceOption[];
  defaultMultipleChoiceValues?: string[];
  onConfirm: (params: OnConfirmParams) => Promise<void> | void;
  onCancel?: () => Promise<void>;
  singleChoiceOptions?: ChoiceOption[];
  defaultSingleChoiceValue?: string | null;
  swipeToConfirm?: boolean;
  swipeToConfirmTitleKey?: string;
};

export const ConfirmActions = {
  show: ({
    titleKey = "common:confirm",
    cancelButtonStyle = undefined,
    cancelButtonTextKey = "common:cancel",
    confirmButtonStyle = undefined,
    confirmButtonTextKey = "common:confirm",
    messageKey = undefined,
    messageParams = {},
    multipleChoiceOptions = [],
    onConfirm,
    onCancel = undefined,
    singleChoiceOptions = [],
    defaultMultipleChoiceValues = [],
    defaultSingleChoiceValue = null,
    swipeToConfirm = false,
    swipeToConfirmTitleKey = "common:swipeToConfirm",
  }: ConfirmShowParams) =>
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
    selectedSingleChoiceValue,
  }: OnConfirmParams) =>
    confirm({ selectedMultipleChoiceValues, selectedSingleChoiceValue }),
  cancel,
};
export { ConfirmReducer };
