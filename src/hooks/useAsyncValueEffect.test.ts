import { startAsyncValueFetch } from "./useAsyncValueEffect";

const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

describe("startAsyncValueFetch", () => {
  it("passes the fetched value", async () => {
    const onValue = jest.fn();
    startAsyncValueFetch({ fetch: async () => "value", onValue });
    await flushPromises();
    expect(onValue).toHaveBeenCalledWith("value");
  });

  it("ignores the value when cancelled", async () => {
    const onValue = jest.fn();
    const cancel = startAsyncValueFetch({
      fetch: async () => "value",
      onValue,
    });
    cancel();
    await flushPromises();
    expect(onValue).not.toHaveBeenCalled();
  });

  it("passes the error, also when cancelled", async () => {
    const error = new Error("fetch error");
    const onValue = jest.fn();
    const onError = jest.fn();
    startAsyncValueFetch({
      fetch: async () => {
        throw error;
      },
      onValue,
      onError,
    });
    const cancel = startAsyncValueFetch({
      fetch: async () => {
        throw error;
      },
      onValue,
      onError,
    });
    cancel();
    await flushPromises();
    expect(onError).toHaveBeenCalledTimes(2);
    expect(onError).toHaveBeenCalledWith(error);
    expect(onValue).not.toHaveBeenCalled();
  });
});
