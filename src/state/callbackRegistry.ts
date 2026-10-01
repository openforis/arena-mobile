// Keeps callbacks (functions) outside of the Redux store, which must contain only serializable
// values: the store keeps only the numeric id returned by `register`, and the component or thunk
// that needs a callback looks it up by that id.
export type CallbackRegistry<T> = {
  register: (callbacks: T) => number;
  get: (id?: number | null) => T | undefined;
  remove: (id?: number | null) => void;
};

export const createCallbackRegistry = <T>(): CallbackRegistry<T> => {
  const callbacksById = new Map<number, T>();
  let lastId = 0;

  return {
    register: (callbacks: T): number => {
      lastId += 1;
      callbacksById.set(lastId, callbacks);
      return lastId;
    },
    get: (id?: number | null): T | undefined =>
      id == null ? undefined : callbacksById.get(id),
    remove: (id?: number | null): void => {
      if (id != null) {
        callbacksById.delete(id);
      }
    },
  };
};
