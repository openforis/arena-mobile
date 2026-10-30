import { DataEntrySelectors } from "./selectors";

let queue: Promise<unknown> = Promise.resolve();

const selectRecordUuid = (getState: any) =>
  DataEntrySelectors.selectRecord(getState())?.uuid;

// an update reads the record, does slow work and then stores the whole record:
// two running together would overwrite each other's changes.
// When its turn comes, an update is skipped if the record it was meant for is not the open one anymore.
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
