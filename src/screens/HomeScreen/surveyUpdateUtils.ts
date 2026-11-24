import { ArenaSurvey, ArenaUser, Dates, Surveys } from "@openforis/arena-core";

import { SurveyStatus, UpdateStatus } from "model";
import type { Navigator } from "navigation/navigator";
import { SurveyService } from "service";
import { SurveyActions } from "state";
import type { AppDispatch } from "state/store";

// survey stored in the device (remoteId: id of the survey in the server)
type LocalSurvey = ArenaSurvey & { remoteId?: number };

type DetermineSurveyUpdateStatusParams = {
  networkAvailable: boolean;
  survey: LocalSurvey;
  surveyName?: string;
  user: ArenaUser | null | undefined;
};

export type DetermineSurveyUpdateStatusResult = {
  errorKey?: string | null;
  updateStatus: UpdateStatus | SurveyStatus;
};

type TriggerSurveyUpdateParams = {
  confirmMessageKey?: string;
  dispatch: AppDispatch;
  navigator?: Navigator | null;
  onCancel?: (() => void) | null;
  onComplete?: (() => void) | null;
  onConfirm?: (() => void) | null;
  skipConfirmation?: boolean;
  survey: LocalSurvey;
};

export const determineSurveyUpdateStatus = async ({
  networkAvailable,
  survey,
  surveyName = Surveys.getName(survey),
  user,
}: DetermineSurveyUpdateStatusParams): Promise<DetermineSurveyUpdateStatusResult> => {
  if (!user) {
    return { updateStatus: UpdateStatus.error };
  }
  if (!networkAvailable) {
    return { updateStatus: UpdateStatus.networkNotAvailable };
  }
  const remoteSurveyId = survey.remoteId;
  if (!remoteSurveyId) {
    return { updateStatus: SurveyStatus.notInArenaServer };
  }
  const surveyRemote = await SurveyService.fetchSurveySummaryRemote({
    id: remoteSurveyId,
    name: surveyName,
  });
  if (!surveyRemote) {
    return { updateStatus: SurveyStatus.notInArenaServer };
  }
  if (surveyRemote.errorKey) {
    return {
      updateStatus: UpdateStatus.error,
      errorKey: surveyRemote.errorKey,
    };
  }
  if (!Surveys.isVisibleInMobile(surveyRemote)) {
    return { updateStatus: SurveyStatus.notVisibleInMobile };
  }
  if (
    Dates.isAfter(
      surveyRemote.datePublished ?? surveyRemote.dateModified,
      (survey.datePublished ?? survey.dateModified)!,
    )
  ) {
    return { updateStatus: UpdateStatus.notUpToDate };
  }

  return { updateStatus: UpdateStatus.upToDate };
};

export const triggerSurveyUpdate = ({
  confirmMessageKey = "surveys:updateSurveyConfirmMessage",
  dispatch,
  navigator = null,
  onCancel = null,
  onComplete = null,
  onConfirm = null,
  skipConfirmation = false,
  survey,
}: TriggerSurveyUpdateParams) =>
  dispatch(
    SurveyActions.updateSurveyRemote({
      surveyId: survey.id!,
      surveyName: Surveys.getName(survey),
      // update triggered only when the survey is in the server
      surveyRemoteId: survey.remoteId!,
      navigator,
      confirmMessageKey,
      onConfirm,
      onCancel,
      onComplete,
      skipConfirmation,
    }),
  );
