let queue: Promise<unknown> = Promise.resolve();

// an update reads the record, does slow work and then stores the whole record:
// two running together would overwrite each other's changes
export const serializeRecordUpdate =
  <T>(update: (dispatch: any, getState: any) => Promise<T>) =>
  (dispatch: any, getState: any): Promise<T> => {
    const result = queue.then(() => update(dispatch, getState));
    queue = result.catch(() => {});
    return result;
  };
