import { RecordUpdater, Records } from "@openforis/arena-core";

import { SystemUtils } from "utils";

import { DataEntrySelectors } from "./selectors";
import { serializeRecordUpdate } from "./recordUpdateQueue";
import { selectRecordUpdaterParams } from "./recordUpdaterParams";
import { removeNodesFlags, updateRecord } from "./recordUpdateHelpers";

// expressions using appId(), appVersion() or appPlatform() are evaluated again when the record is edited
// for the first time with this app (e.g. created on another platform or with a previous app version)
export const updateRecordAppInfoDependents = serializeRecordUpdate(
  async (dispatch, getState) => {
    const state = getState();
    if (!DataEntrySelectors.selectCanEditRecord(state)) return;

    const record = DataEntrySelectors.selectRecord(state);
    const appInfo = SystemUtils.getRecordAppInfo();
    if (!Records.isAppInfoChanged(appInfo)(record)) return;

    const updaterParams = selectRecordUpdaterParams(state);
    const { record: recordUpdated, nodes } =
      await RecordUpdater.updateAppInfoDependents({
        ...updaterParams,
        record,
      });
    removeNodesFlags(nodes);
    await updateRecord({
      dispatch,
      getState,
      survey: updaterParams.survey,
      record: recordUpdated,
    });
  },
);
