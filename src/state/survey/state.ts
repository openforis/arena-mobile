import {
  LanguageCode,
  ArenaSurvey,
  ArenaUserGroup,
} from "@openforis/arena-core";

const stateKey = "survey";

export type SurveyState = {
  currentSurvey?: (ArenaSurvey & { remoteId?: number }) | null;
  currentSurveyPreferredLanguage?: LanguageCode | null;
  currentSurveyCycle?: string | null;
  currentSurveyUserGroup?: ArenaUserGroup | null;
  currentSurveyUserGroupReady?: boolean;
  surveysLocal: any[];
};

export const SurveyState = {
  stateKey,
};
