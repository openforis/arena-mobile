import type { ArenaSurveySummary } from "@openforis/arena-core";

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

// survey summary returned by the server (only published surveys are fetched)
export type SurveySummaryRemote = ArenaSurveySummary & {
  id: number;
  datePublished: string;
};

// props used when searching surveys by text
export type SurveySearchable = {
  name?: string | null;
  label?: string | null;
  defaultLabel?: string | null;
};
