import { DataEntrySelectors } from "./selectors";

let queue: Promise<unknown> = Promise.resolve();

const selectRecordUuid = (getState: any) =>
  DataEntrySelectors.selectRecord(getState())?.uuid;

// one at a time: an update stores the whole record, so concurrent ones would lose changes
export const serializeRecordUpdate =
  <T>(update: (dispatch: any, getState: any) => Promise<T>) =>
  (dispatch: any, getState: any): Promise<T | undefined> => {
    const recordUuid = selectRecordUuid(getState);
    const result = queue.then(() =>
      recordUuid && selectRecordUuid(getState) === recordUuid
        ? update(dispatch, getState)
        : undefined,
    );
    queue = result.catch(() => {});
    return result;
  };
