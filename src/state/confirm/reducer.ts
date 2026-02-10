import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Keyboard } from "react-native";

export type OnConfirmParams = {
  selectedMultipleChoiceValues?: string[];
  selectedSingleChoiceValue?: string | null;
  textInputValue?: string;
};

type ChoiceOption = { label: string; value: string };

export type ConfirmShowParams = {
  titleKey?: string;
  cancelButtonStyle?: any;
  cancelButtonTextKey?: string;
  confirmButtonStyle?: any;
  confirmButtonTextKey?: string;
  defaultMultipleChoiceValues?: string[];
  defaultSingleChoiceValue?: string | null;
  defaultTextInputValue?: string;
  messageKey?: string;
  messageParams?: any;
  multipleChoiceOptions?: ChoiceOption[];
  onConfirm: (params: OnConfirmParams) => Promise<void> | void;
  onCancel?: () => Promise<void>;
  singleChoiceOptions?: ChoiceOption[];
  swipeToConfirm?: boolean;
  swipeToConfirmTitleKey?: string;
  textInputToConfirm?: boolean;
  textInputToConfirmLabelKey?: string;
};

const confirmShowDefaultParams: Partial<ConfirmShowParams> = {
  titleKey: "common:confirm",
  cancelButtonTextKey: "common:cancel",
  confirmButtonTextKey: "common:confirm",
  messageParams: {},
  multipleChoiceOptions: [],
  singleChoiceOptions: [],
  defaultMultipleChoiceValues: [],
  swipeToConfirm: false,
  swipeToConfirmTitleKey: "common:swipeToConfirm",
  textInputToConfirm: false,
  textInputToConfirmLabelKey: "common:textInputToConfirmLabel",
};

export type ConfirmState = Partial<ConfirmShowParams> & {
  isOpen: boolean;
};

const initialState: ConfirmState = {
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

export const ConfirmActions = {
  show: (params: ConfirmShowParams) =>
    show({ ...confirmShowDefaultParams, ...params }),
  dismiss,

  // internal (called from dialog component)
  confirm: (params: OnConfirmParams) => confirm(params),
  cancel,
};
export { ConfirmReducer };
