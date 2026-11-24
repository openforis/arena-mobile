// survey stored in the device db (content not loaded)
export type SurveySummaryLocal = {
  id: number;
  serverUrl: string;
  remoteId: number;
  uuid: string;
  name: string;
  label: string | null;
  // date published (or modified) of the survey in the server
  dateModified: string;
};
