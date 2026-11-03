import { configureStore } from "@reduxjs/toolkit";

import { MessageActions, MessageReducer } from "./reducer";

const createStore = () =>
  configureStore({ reducer: { message: MessageReducer } });

describe("MessageReducer", () => {
  it("replaces the previous message instead of merging into it", () => {
    const store = createStore();
    store.dispatch(
      MessageActions.setMessage({
        content: "first",
        details: "first details",
        title: "first title",
        onDismiss: () => {},
      }) as any,
    );
    expect(store.getState().message).toMatchObject({
      details: "first details",
    });

    store.dispatch(MessageActions.setInfo("second") as any);

    expect(store.getState().message).toEqual({
      content: "second",
      contentParams: null,
      details: null,
      detailsParams: null,
      onDismissId: null,
      title: "common:info",
    });
  });

  it("sets the warning title", () => {
    const store = createStore();
    store.dispatch(MessageActions.setWarning("warn") as any);
    expect(store.getState().message).toMatchObject({
      content: "warn",
      title: "common:warning",
    });
  });
});
