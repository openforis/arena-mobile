import { LanguageCode, Survey, UserGroup } from "@openforis/arena-core";

const stateKey = "survey";

export type SurveyState = {
  currentSurvey?: Survey & { remoteId?: number };
  currentSurveyPreferredLanguage?: LanguageCode | null;
  currentSurveyCycle?: string | null;
  currentSurveyUserGroup?: UserGroup | null;
  currentSurveyUserGroupReady?: boolean;
  surveysLocal: any[];
};

export const SurveyState = {
  stateKey,
};
