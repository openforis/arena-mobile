import { Dates } from "@openforis/arena-core";

import { AreaOfInterestProviderDefault } from "service/areaOfInterestProvider";

import { RemoteConnectionSelectors } from "../remoteConnection";
import { SurveySelectors } from "../survey";
import { DataEntrySelectors } from "./selectors";
import type { RootState } from "../store";

// parameters shared by the RecordUpdater calls on the record being edited
export const selectRecordUpdaterParams = (state: RootState) => ({
  user: RemoteConnectionSelectors.selectLoggedUserSafe(state),
  survey: SurveySelectors.selectCurrentSurvey(state)!,
  prevCycleRecord: DataEntrySelectors.selectPreviousCycleRecord(state),
  areaOfInterestProvider: AreaOfInterestProviderDefault,
  // otherwise date/time default values (e.g. now()) are converted in UTC
  timezoneOffset: Dates.getTimezoneOffset(),
});
