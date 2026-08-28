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
  confirmButtonEnableFn?: (params: OnConfirmParams) => boolean;
  defaultMultipleChoiceValues?: string[];
  defaultSingleChoiceValue?: string | null;
  defaultTextInputValue?: string;
  messageIsMarkdown?: boolean;
  messageKey?: string;
  messageParams?: any;
  multipleChoiceOptions?: ChoiceOption[];
  onConfirm: (params: OnConfirmParams) => Promise<void> | void;
  onCancel?: () => Promise<void> | void;
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
  messageIsMarkdown: false,
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
  showId?: number;
};

const initialState: ConfirmState = {
  isOpen: false,
};

// confirm and cancel as async thunk to allow calling "dispatch" inside onConfirm and onCancel
// each returns the showId of the dialog it was resolving, so a delayed fulfilled action (arriving
// after a new dialog has already been shown, e.g. a confirm() chained right after another) doesn't
// clobber that newer dialog's state
const confirm = createAsyncThunk(
  "confirm/show",
  async (params: OnConfirmParams, { getState }) => {
    const state: any = getState();
    const { onConfirm, showId } = state.confirm;
    await onConfirm?.(params);
    return showId;
  },
);

const cancel = createAsyncThunk(
  "confirm/cancel",
  async (_params, { getState }) => {
    const state: any = getState();
    const { onCancel, showId } = state.confirm;
    await onCancel?.();
    return showId;
  },
);

const confirmSlice = createSlice({
  name: "confirm",
  initialState,
  reducers: {
    show: (state, action) => {
      Keyboard.dismiss();
      return { ...action.payload, isOpen: true, showId: (state.showId ?? 0) + 1 };
    },
    dismiss: (state) => ({ ...initialState, showId: state.showId }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(confirm.fulfilled, (state, action) =>
        state.showId === action.payload ? initialState : state,
      )
      .addCase(cancel.fulfilled, (state, action) =>
        state.showId === action.payload ? initialState : state,
      );
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
