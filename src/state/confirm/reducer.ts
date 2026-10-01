import {
  createAsyncThunk,
  createSlice,
  Dispatch,
  PayloadAction,
} from "@reduxjs/toolkit";
import { Keyboard } from "react-native";

import { log } from "utils";

import { createCallbackRegistry } from "../callbackRegistry";

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

// callbacks are kept outside of the store (functions are not serializable): the store contains only
// the showId the callbacks are registered with
type ConfirmCallbacks = Pick<
  ConfirmShowParams,
  "onConfirm" | "onCancel" | "confirmButtonEnableFn"
>;

export type ConfirmDataParams = Omit<ConfirmShowParams, keyof ConfirmCallbacks>;

export type ConfirmState = Partial<ConfirmDataParams> & {
  isOpen: boolean;
  showId?: number;
};

const initialState: ConfirmState = {
  isOpen: false,
};

export const ConfirmCallbacksRegistry = createCallbackRegistry<ConfirmCallbacks>();

const getConfirmState = (getState: () => unknown): ConfirmState =>
  (getState() as { confirm: ConfirmState }).confirm;

// takes the callbacks of the dialog currently shown out of the registry: once the dialog is being
// resolved (confirmed, cancelled or dismissed), its callbacks must not be invoked again (e.g. as
// a "cancel" when another dialog is shown from inside its own onConfirm)
const takeCurrentCallbacks = (
  getState: () => unknown,
): { showId?: number; callbacks?: ConfirmCallbacks } => {
  const { showId } = getConfirmState(getState);
  const callbacks = ConfirmCallbacksRegistry.get(showId);
  ConfirmCallbacksRegistry.remove(showId);
  return { showId, callbacks };
};

// confirm and cancel as async thunk to allow calling "dispatch" inside onConfirm and onCancel
// each returns the showId of the dialog it was resolving, so a delayed fulfilled action (arriving
// after a new dialog has already been shown, e.g. a confirm() chained right after another) doesn't
// clobber that newer dialog's state
const confirm = createAsyncThunk(
  "confirm/confirm",
  async (params: OnConfirmParams, { getState }) => {
    const { showId, callbacks } = takeCurrentCallbacks(getState);
    await callbacks?.onConfirm?.(params);
    return showId;
  },
);

const cancel = createAsyncThunk(
  "confirm/cancel",
  async (_params: void, { getState }) => {
    const { showId, callbacks } = takeCurrentCallbacks(getState);
    await callbacks?.onCancel?.();
    return showId;
  },
);

const confirmSlice = createSlice({
  name: "confirm",
  initialState,
  reducers: {
    show: (_state, action: PayloadAction<ConfirmDataParams & { showId: number }>) => ({
      ...action.payload,
      isOpen: true,
    }),
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

// a dialog closed without an answer from the user (dismissed or replaced by another one) is
// treated as cancelled, so a caller awaiting its answer (see ConfirmUtils.confirm) is not left
// hanging
const cancelCurrentIfOpen = (getState: () => unknown) => {
  if (!getConfirmState(getState).isOpen) return;
  const { callbacks } = takeCurrentCallbacks(getState);
  Promise.resolve(callbacks?.onCancel?.()).catch((error) =>
    log.error(`error cancelling confirm dialog: ${String(error)}`),
  );
};

const show =
  (params: ConfirmShowParams) =>
  (dispatch: Dispatch, getState: () => unknown): number => {
    const { onConfirm, onCancel, confirmButtonEnableFn, ...data } = {
      ...confirmShowDefaultParams,
      ...params,
    };
    cancelCurrentIfOpen(getState);
    Keyboard.dismiss();
    const showId = ConfirmCallbacksRegistry.register({
      onConfirm,
      onCancel,
      confirmButtonEnableFn,
    });
    dispatch(actions.show({ ...data, showId }));
    return showId;
  };

const dismiss = () => (dispatch: Dispatch, getState: () => unknown) => {
  cancelCurrentIfOpen(getState);
  dispatch(actions.dismiss());
};

export const ConfirmActions = {
  show,
  dismiss,

  // internal (called from dialog component)
  confirm: (params: OnConfirmParams) => confirm(params),
  cancel: () => cancel(),
};
export { ConfirmReducer };
