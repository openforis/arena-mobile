import { useCallback, useState } from "react";

import { UpdateStatusIcon } from "components";
import { useToast } from "hooks";
import { useTranslation } from "localization";
import { SurveyStatus, UpdateStatus } from "model";
import { SurveySelectors, useAppDispatch } from "state";

import { triggerSurveyUpdate } from "./surveyUpdateUtils";

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
        triggerSurveyUpdate({
          dispatch,
          survey,
          confirmMessageKey: "surveys:updateSurveyWithNewVersionConfirmMessage",
          onConfirm: () => setLoading(true),
          onComplete: () => setLoading(false),
        });
        break;
    }
  }, [dispatch, errorKey, onPressProp, survey, t, toaster, updateStatus]);

  return (
    <UpdateStatusIcon
      loading={loading}
      updateStatus={updateStatus as UpdateStatus}
      onPress={onPress}
    />
  );
};
