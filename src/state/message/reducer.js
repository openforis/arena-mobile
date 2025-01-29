import { createSlice } from "@reduxjs/toolkit";

const initialState = {};

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setMessage: (state, action) => {
      Object.assign(state, action.payload);
    },
    dismissMessage: () => initialState,
  },
});

const { actions, reducer: MessageReducer } = messageSlice;
const { setMessage, dismissMessage } = actions;

export const MessageActions = {
  setMessage: ({
    content,
    contentParams = null,
    details = null,
    detailsParams = null,
    onDismiss = null,
    title = "common:info",
  }) =>
    setMessage({
      content,
      contentParams,
      details,
      detailsParams,
      onDismiss,
      title,
    }),
  dismissMessage,
};
export { MessageReducer };
