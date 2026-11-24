import {
  LanguageCode,
  ArenaSurvey,
  ArenaUserGroup,
} from "@openforis/arena-core";

import type { SurveySummaryLocal } from "model";

const stateKey = "survey";

export type CurrentSurvey = ArenaSurvey & { remoteId?: number };

export type SurveyState = {
  currentSurvey?: CurrentSurvey | null;
  currentSurveyPreferredLanguage?: LanguageCode | null;
  currentSurveyCycle?: string | null;
  currentSurveyUserGroup?: ArenaUserGroup | null;
  currentSurveyUserGroupReady?: boolean;
  surveysLocal: SurveySummaryLocal[];
};

export const SurveyState = {
  stateKey,
};
