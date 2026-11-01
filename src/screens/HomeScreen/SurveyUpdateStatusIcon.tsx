import { useCallback, useState } from "react";

import { UpdateStatusIcon } from "components";
import { useToast } from "hooks";
import { useTranslation } from "localization";
import { SurveyStatus, UpdateStatus } from "model";
import { SurveySelectors, useAppDispatch } from "state";

import {
  type DetermineSurveyUpdateStatusResult,
  triggerSurveyUpdate,
} from "./surveyUpdateUtils";

type Props = {
  errorKey?: string | null;
  onPress?: () => Promise<DetermineSurveyUpdateStatusResult | undefined>;
  updateStatus: UpdateStatus | SurveyStatus;
};

export const SurveyUpdateStatusIcon = ({
  errorKey: errorKeyProp,
  onPress: onPressProp = undefined,
  updateStatus: updateStatusProp,
}: Props) => {
  const dispatch = useAppDispatch();
  const toaster = useToast();
  const { t } = useTranslation();
  const survey = SurveySelectors.useCurrentSurvey()!;
  const [loading, setLoading] = useState(false);

  const onPress = useCallback(async () => {
    // use the status just fetched: the props still hold the one from before the press
    const { errorKey, updateStatus } = (await onPressProp?.()) ?? {
      errorKey: errorKeyProp,
      updateStatus: updateStatusProp,
    };

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
  }, [
    dispatch,
    errorKeyProp,
    onPressProp,
    survey,
    t,
    toaster,
    updateStatusProp,
  ]);

  return (
    <UpdateStatusIcon
      loading={loading}
      updateStatus={updateStatusProp as UpdateStatus}
      onPress={onPress}
    />
  );
};
