import { Dates, Surveys } from "@openforis/arena-core";

import { SurveyStatus, UpdateStatus } from "model";
import { SurveyService } from "service";
import { SurveyActions } from "state";

type DetermineSurveyUpdateStatusParams = {
  networkAvailable: boolean;
  survey: any;
  surveyName?: string;
  user: any;
};

type DetermineSurveyUpdateStatusResult = {
  errorKey?: string | null;
  updateStatus: UpdateStatus | SurveyStatus;
};

type TriggerSurveyUpdateParams = {
  confirmMessageKey?: string;
  dispatch: any;
  navigation: any;
  onCancel?: (() => void) | null;
  onComplete?: (() => void) | null;
  onConfirm?: (() => void) | null;
  skipConfirmation?: boolean;
  survey: any;
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

  const surveyRemote = await SurveyService.fetchSurveySummaryRemote({
    id: survey.remoteId,
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
      // @ts-ignore datePublished is available in persisted surveys but missing from current type
      survey.datePublished ?? survey.dateModified,
    )
  ) {
    return { updateStatus: UpdateStatus.notUpToDate };
  }

  return { updateStatus: UpdateStatus.upToDate };
};

export const triggerSurveyUpdate = ({
  confirmMessageKey = "surveys:updateSurveyConfirmMessage",
  dispatch,
  navigation,
  onCancel = null,
  onComplete = null,
  onConfirm = null,
  skipConfirmation = false,
  survey,
}: TriggerSurveyUpdateParams) =>
  dispatch(
    SurveyActions.updateSurveyRemote({
      surveyId: survey.id,
      surveyName: Surveys.getName(survey),
      surveyRemoteId: survey.remoteId,
      navigation,
      confirmMessageKey,
      onConfirm,
      onCancel,
      onComplete,
      skipConfirmation,
    }),
  );
