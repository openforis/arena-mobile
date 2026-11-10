import { RecordService } from "service";

import { RecordUtils } from "model";
import type { AppDispatch, AppGetState } from "state/store";

import { fetchRecordsFromServer } from "./actionsRecordsImport";
import { MessageActions } from "../message";
import { SurveySelectors } from "../survey";
import { DataEntryActionsRecordSync } from "./actionsRecordSync";
import { DataEntrySelectors } from "./selectors";
import { i18n } from "localization";

const { t } = i18n;

const showMergedRecordsMessage = async ({
  dispatch,
  survey,
  lang,
  cycle,
  recordUuids,
}: any) => {
  const recordsSummary = await RecordService.fetchRecords({
    survey,
    cycle,
    onlyLocal: false,
  });
  const recordsList = recordsSummary
    .filter((recordSummary: any) => recordUuids.includes(recordSummary.uuid))
    .map((recordSummary: any) => {
      const keyValuesByName = RecordUtils.getRecordSummaryValuesByKeyFormatted({
        survey,
        lang,
        recordSummary,
        t,
      });
      const keysText =
        Object.values(keyValuesByName).join(" - ") || recordSummary.uuid;
      return `- ${keysText}`;
    })
    .join("\n");

  dispatch(
    MessageActions.setMessage({
      content: "dataEntry:dataExport.recordsMergedMessage",
      contentParams: { recordsList },
    }),
  );
};

// re-downloads the given records (their content on the server is now the merged version,
// whether merged with newer edits on the same uuid or merged into a pre-existing uuid with the
// same key(s)) so the local copy reflects it, then lets the user know which records were merged.
// Awaited by the caller so the fetch (nodes + files) has actually finished, and the local copy is
// marked as fully downloaded, before anything reloads the records list.
// Returns true only if the records have actually been fetched and stored in the device (the
// fetch can fail, be canceled, or not be allowed by the survey - none of which is thrown).
// When silent (auto-sync), nothing is shown: neither the fetch progress, nor the final message.
export const fetchMergedRecordsAndNotify = async ({
  dispatch,
  survey,
  lang,
  cycle,
  recordUuids,
  mergeKeepLocalOriginRecordUuids,
  silent = false,
}: any): Promise<boolean> => {
  let fetched = false;
  await dispatch(
    fetchRecordsFromServer({
      recordUuids,
      mergeKeepLocalOriginRecordUuids,
      silent,
      onImportComplete: async () => {
        fetched = true;
        if (!silent) {
          await showMergedRecordsMessage({
            dispatch,
            survey,
            lang,
            cycle,
            recordUuids,
          });
        }
      },
    }),
  );
  return fetched;
};

// the records merged with their own server copy whose local copy can be replaced right away
// with the merged version. When the merge wasn't started by the user (auto-sync), the record open
// in the editor can be replaced only if it's been made read-only for this (see lockOpenRecordForSync);
// otherwise (e.g. it's been opened after the upload started) the editor may hold edits the merged
// version doesn't have, which the next edit would write over it. It's then left as it is (still
// "modified on the server too"), to be merged again later.
export const getMergedSameRecordUuidsToFetch = ({
  getState,
  mergedSameRecordUuids,
  silent,
}: any): string[] => {
  if (!silent) return mergedSameRecordUuids;
  const state = getState();
  if (DataEntrySelectors.selectRecordSyncInProgress(state))
    return mergedSameRecordUuids;
  const openRecordUuid = DataEntrySelectors.selectRecord(state)?.uuid;
  return mergedSameRecordUuids.filter(
    (uuid: string) => uuid !== openRecordUuid,
  );
};

// replaces the local copy of the given records with the version merged on the server, without
// showing anything; if one of them is open in the editor (read-only meanwhile, see above), the
// editor is then given the merged version too
export const fetchMergedSameRecordsSilently = async ({
  dispatch,
  getState,
  survey,
  lang,
  cycle,
  recordUuids,
}: any) => {
  await DataEntryActionsRecordSync.runReplacingRecords(
    recordUuids,
    async () => {
      const fetched = await fetchMergedRecordsAndNotify({
        dispatch,
        survey,
        lang,
        cycle,
        recordUuids,
        mergeKeepLocalOriginRecordUuids: recordUuids,
        silent: true,
      });
      const openRecordUuid = DataEntrySelectors.selectRecord(getState())?.uuid;
      if (fetched && openRecordUuid && recordUuids.includes(openRecordUuid)) {
        await dispatch(DataEntryActionsRecordSync.reloadOpenRecord());
      }
    },
  );
};

export const fetchRecordsChangedRemotely =
  ({ cycle, recordUuids }: any) =>
  async (dispatch: AppDispatch, getState: AppGetState) => {
    const state = getState();
    const survey = SurveySelectors.selectCurrentSurvey(state)!;
    const lang = SurveySelectors.selectCurrentSurveyPreferredLang(state);
    await fetchMergedSameRecordsSilently({
      dispatch,
      getState,
      survey,
      lang,
      cycle,
      recordUuids,
    });
  };
