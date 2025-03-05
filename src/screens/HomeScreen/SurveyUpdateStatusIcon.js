import { useNavigation } from "@react-navigation/native";
import PropTypes from "prop-types";
import { useState } from "react";
import { useDispatch } from "react-redux";

import { Surveys } from "@openforis/arena-core";

import { UpdateStatusIcon } from "components";
import { useToast } from "hooks";
import { useTranslation } from "localization";
import { SurveyStatus, UpdateStatus } from "model";
import { SurveyActions, SurveySelectors } from "state";

export const SurveyUpdateStatusIcon = ({ updateStatus, errorKey }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const toaster = useToast();
  const { t } = useTranslation();
  const survey = SurveySelectors.useCurrentSurvey();
  const [loading, setLoading] = useState(false);

  const onPress = () => {
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
  };
  return (
    <UpdateStatusIcon
      loading={loading}
      updateStatus={updateStatus}
      onPress={onPress}
    />
  );
};

SurveyUpdateStatusIcon.propTypes = {
  updateStatus: PropTypes.string.isRequired,
  errorKey: PropTypes.string,
};
