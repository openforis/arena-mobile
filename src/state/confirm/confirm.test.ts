import { configureStore } from "@reduxjs/toolkit";

import { ConfirmActions, ConfirmReducer } from "./reducer";
import { ConfirmUtils } from "./utils";

jest.mock("react-native", () => ({ Keyboard: { dismiss: jest.fn() } }));
jest.mock("utils", () => ({ log: { error: jest.fn() } }));

const createStore = () =>
  configureStore({
    reducer: { confirm: ConfirmReducer },
    // fail on any non-serializable value put into the store
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          isSerializable: (value: unknown) => typeof value !== "function",
        },
      }),
  });

describe("confirm", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // the serializable check middleware reports non-serializable values via console.error
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it("keeps only serializable values in the store and awaits async onConfirm", async () => {
    const store = createStore();
    const calls: string[] = [];
    store.dispatch(
      ConfirmActions.show({
        messageKey: "test",
        confirmButtonEnableFn: () => true,
        onConfirm: async ({ textInputValue }) => {
          await Promise.resolve();
          calls.push(`confirm:${textInputValue}`);
        },
        onCancel: () => {
          calls.push("cancel");
        },
      }),
    );
    const state = store.getState().confirm;
    expect(state.isOpen).toBe(true);
    expect(Object.values(state).some((v) => typeof v === "function")).toBe(false);

    await store.dispatch(ConfirmActions.confirm({ textInputValue: "abc" }));

    expect(calls).toEqual(["confirm:abc"]);
    expect(store.getState().confirm.isOpen).toBe(false);
  });

  it("calls async onCancel on cancel", async () => {
    const store = createStore();
    const onCancel = jest.fn(async () => {});
    store.dispatch(ConfirmActions.show({ onConfirm: jest.fn(), onCancel }));
    await store.dispatch(ConfirmActions.cancel());
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(store.getState().confirm.isOpen).toBe(false);
  });

  it("resolves ConfirmUtils.confirm with the confirm params or null", async () => {
    const store = createStore();
    const dispatch = store.dispatch;

    const confirmed = ConfirmUtils.confirm({ dispatch, messageKey: "a" });
    await dispatch(
      ConfirmActions.confirm({ selectedSingleChoiceValue: "x" }),
    );
    await expect(confirmed).resolves.toEqual({ selectedSingleChoiceValue: "x" });

    const cancelled = ConfirmUtils.confirm({ dispatch, messageKey: "b" });
    await dispatch(ConfirmActions.cancel());
    await expect(cancelled).resolves.toBeNull();
  });

  it("allows showing a new dialog from inside onConfirm without cancelling the first one", async () => {
    const store = createStore();
    const dispatch = store.dispatch;
    const onCancel = jest.fn();
    let second: Promise<unknown> | null = null;

    dispatch(
      ConfirmActions.show({
        messageKey: "first",
        onConfirm: () => {
          second = ConfirmUtils.confirm({ dispatch, messageKey: "second" });
        },
        onCancel,
      }),
    );
    await dispatch(ConfirmActions.confirm({}));

    expect(onCancel).not.toHaveBeenCalled();
    // the second dialog is still open: the first one's fulfilled action didn't close it
    expect(store.getState().confirm.isOpen).toBe(true);
    expect(store.getState().confirm.messageKey).toBe("second");

    await dispatch(ConfirmActions.confirm({ textInputValue: "y" }));
    await expect(second).resolves.toEqual({ textInputValue: "y" });
  });

  it("cancels a pending dialog replaced by another one", async () => {
    const store = createStore();
    const dispatch = store.dispatch;

    const replaced = ConfirmUtils.confirm({ dispatch, messageKey: "a" });
    const current = ConfirmUtils.confirm({ dispatch, messageKey: "b" });

    await expect(replaced).resolves.toBeNull();
    expect(store.getState().confirm.messageKey).toBe("b");

    await dispatch(ConfirmActions.confirm({}));
    await expect(current).resolves.toEqual({});
  });
});
