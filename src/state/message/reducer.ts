import { createSlice, Dispatch } from "@reduxjs/toolkit";

import { createCallbackRegistry } from "../callbackRegistry";

type MessageCallbacks = {
  onDismiss?: (() => void) | null;
};

// callbacks are kept outside of the store (functions are not serializable): the store contains
// only the onDismissId they are registered with
export const MessageCallbacksRegistry = createCallbackRegistry<MessageCallbacks>();

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

const getOnDismissId = (getState: () => unknown): number | null | undefined =>
  (getState() as { message: { onDismissId?: number | null } }).message
    .onDismissId;

export const MessageActions = {
  setMessage:
    ({
      content,
      contentParams = null,
      details = null,
      detailsParams = null,
      onDismiss = null,
      title = "common:info",
    }: any) =>
    (dispatch: Dispatch, getState: () => unknown) => {
      // the message currently shown (if any) is replaced: its callback won't be used anymore
      MessageCallbacksRegistry.remove(getOnDismissId(getState));
      const onDismissId = onDismiss
        ? MessageCallbacksRegistry.register({ onDismiss })
        : null;
      dispatch(
        setMessage({
          content,
          contentParams,
          details,
          detailsParams,
          onDismissId,
          title,
        }),
      );
    },
  setInfo: (contentKey: any, contentParams?: any) =>
    setMessage({ content: contentKey, contentParams }),
  setWarning: (contentKey: any, contentParams?: any) =>
    setMessage({ content: contentKey, contentParams, title: "common:warning" }),
  dismissMessage: () => (dispatch: Dispatch, getState: () => unknown) => {
    const onDismissId = getOnDismissId(getState);
    const onDismiss = MessageCallbacksRegistry.get(onDismissId)?.onDismiss;
    MessageCallbacksRegistry.remove(onDismissId);
    dispatch(dismissMessage());
    onDismiss?.();
  },
};
export { MessageReducer };
