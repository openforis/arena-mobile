import { useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";

import { Surveys } from "@openforis/arena-core";

import { UpdateStatusIcon } from "components";
import { useToast } from "hooks";
import { useTranslation } from "localization";
import { SurveyStatus, UpdateStatus } from "model";
import { SurveyActions, SurveySelectors, useAppDispatch } from "state";

type Props = {
  errorKey?: string | null;
  onPress?: () => Promise<void>;
  updateStatus: UpdateStatus | SurveyStatus;
};

export const SurveyUpdateStatusIcon = ({
  errorKey,
  onPress: onPressProp = undefined,
  updateStatus,
}: Props) => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const toaster = useToast();
  const { t } = useTranslation();
  const survey = SurveySelectors.useCurrentSurvey()!;
  const [loading, setLoading] = useState(false);

  const onPress = useCallback(async () => {
    await onPressProp?.();

    switch (updateStatus) {
      case UpdateStatus.error: {
        const error = t(errorKey);
        toaster("surveys:updateStatus.error", { error });
        break;
      }
      case UpdateStatus.networkNotAvailable:
        toaster("surveys:updateStatus.networkNotAvailable");
        break;
      case SurveyStatus.notInArenaServer:
        toaster("surveys:status.notInArenaServer");
        break;
      case SurveyStatus.notVisibleInMobile:
        toaster("surveys:status.notVisibleInMobile");
        break;
      case UpdateStatus.upToDate:
        toaster("surveys:updateStatus.upToDate");
        break;
      case UpdateStatus.notUpToDate:
        dispatch(
          SurveyActions.updateSurveyRemote({
            surveyId: survey.id,
            surveyName: Surveys.getName(survey),
            surveyRemoteId: survey.remoteId,
            navigation,
            confirmMessageKey:
              "surveys:updateSurveyWithNewVersionConfirmMessage",
            onConfirm: () => setLoading(true),
            onComplete: () => setLoading(false),
          })
        );
        break;
    }
  }, [
    dispatch,
    errorKey,
    navigation,
    onPressProp,
    survey,
    t,
    toaster,
    updateStatus,
  ]);

  return (
    <UpdateStatusIcon
      loading={loading}
      updateStatus={updateStatus as UpdateStatus}
      onPress={onPress}
    />
  );
};
