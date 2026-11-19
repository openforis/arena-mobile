import { ArenaSurvey } from "@openforis/arena-core";

export type SurveyMobile = ArenaSurvey & {
  id: number;
  remoteId: number;
  serverUrl?: string;
};
