import { Survey } from "@openforis/arena-core";

export type SurveyMobile = Survey & {
  id: number;
  remoteId: number;
  serverUrl?: string;
};
