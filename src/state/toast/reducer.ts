import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  textKey: null,
  textParams: null,
};

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    show: (state, action) => {
      Object.assign(state, action.payload);
    },
    dismiss: () => initialState,
  },
});

const { actions, reducer: ToastReducer } = toastSlice;
const { show, dismiss } = actions;

export const ToastActions = {
  show: (textKey, textParams = {}) => show({ textKey, textParams }),
  dismiss,
};

export { ToastReducer };
