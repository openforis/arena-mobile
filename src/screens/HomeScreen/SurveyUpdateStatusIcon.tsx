import { useNavigation } from "@react-navigation/native";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";
import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";

import { Surveys } from "@openforis/arena-core";

import { UpdateStatusIcon } from "components";
import { useToast } from "hooks";
import { useTranslation } from "localization";
import { SurveyStatus, UpdateStatus } from "model";
import { SurveyActions, SurveySelectors } from "state";

export const SurveyUpdateStatusIcon = ({
  errorKey,
  onPress: onPressProp = undefined,
  updateStatus
}: any) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const toaster = useToast();
  const { t } = useTranslation();
  const survey = SurveySelectors.useCurrentSurvey();
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
          // @ts-expect-error TS(2345): Argument of type '(dispatch: any) => Promise<void>... Remove this comment to see the full error message
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
      updateStatus={updateStatus}
      onPress={onPress}
    />
  );
};

SurveyUpdateStatusIcon.propTypes = {
  errorKey: PropTypes.string,
  onPress: PropTypes.func,
  updateStatus: PropTypes.string.isRequired,
};
