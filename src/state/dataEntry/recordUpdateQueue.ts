import { DataEntrySelectors } from "./selectors";
import type { AppDispatch, RootState } from "../store";

let queue: Promise<unknown> = Promise.resolve();

const selectRecordUuid = (getState: () => RootState) =>
  DataEntrySelectors.selectRecord(getState())?.uuid;

// one at a time: an update stores the whole record, so concurrent ones would lose changes
export const serializeRecordUpdate =
  <T>(
    update: (dispatch: AppDispatch, getState: () => RootState) => Promise<T>,
  ) =>
  (
    dispatch: AppDispatch,
    getState: () => RootState,
  ): Promise<T | undefined> => {
    const recordUuid = selectRecordUuid(getState);
    const result = queue.then(() =>
      recordUuid && selectRecordUuid(getState) === recordUuid
        ? update(dispatch, getState)
        : undefined,
    );
    queue = result.catch(() => {});
    return result;
  };
