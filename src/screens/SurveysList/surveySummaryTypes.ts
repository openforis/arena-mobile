import type { ArenaSurvey } from "@openforis/arena-core";

// survey summary read from the device db
export type SurveySummaryLocal = {
  id: number;
  uuid: string;
  name: string;
  label?: string | null;
  remoteId?: number | null;
  serverUrl?: string | null;
  dateModified: string;
};

// survey summary returned by the server (only published surveys are fetched)
export type SurveySummaryRemote = ArenaSurvey & {
  name?: string;
  label?: string;
  defaultLabel?: string;
  datePublished: string;
};

// props used when searching surveys by text
export type SurveySearchable = {
  name?: string | null;
  label?: string | null;
  defaultLabel?: string | null;
};
