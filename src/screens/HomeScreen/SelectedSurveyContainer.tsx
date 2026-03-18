import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";

import { Surveys } from "@openforis/arena-core";

import {
  Button,
  Card,
  HView,
  Link,
  Text,
  ViewMoreText,
  VView,
} from "components";
import { useIsNetworkConnected } from "hooks";
import { SurveyStatus, UpdateStatus } from "model";
import { SurveyService } from "service";
import { RemoteConnectionSelectors, SurveySelectors } from "state";

import { screenKeys } from "../screenKeys";
import { SurveyUpdateStatusIcon } from "./SurveyUpdateStatusIcon";
import { determineSurveyUpdateStatus } from "./surveyUpdateUtils";

import styles from "./selectedSurveyContainerStyles";

type SelectedSurveyContainerState = {
  updateStatus: UpdateStatus | SurveyStatus;
  errorKey?: string | null;
};

export const SelectedSurveyContainer = () => {
  const navigation = useNavigation();
  const networkAvailable = useIsNetworkConnected();
  const user = RemoteConnectionSelectors.useLoggedInUser();

  const survey = SurveySelectors.useCurrentSurvey()!;
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();

  const surveyName = Surveys.getName(survey);
  const surveyLabelInDefaultLanguage = Surveys.getLabel(lang)(survey);
  const surveyTitle = surveyLabelInDefaultLanguage
    ? `${surveyLabelInDefaultLanguage} [${surveyName}]`
    : surveyName;
  const surveyDescription = Surveys.getDescription(lang)(survey);
  const fieldManualUrl = Surveys.getFieldManualLink(lang)(survey);
  const isDemoSurvey = survey?.uuid === SurveyService.demoSurveyUuid;

  const [state, setState] = useState({
    updateStatus: UpdateStatus.loading,
    errorKey: null,
  } as SelectedSurveyContainerState);
  const { updateStatus, errorKey } = state;

  const determineStatus = useCallback(async () => {
    if (!survey) {
      return;
    }
    setState(
      await determineSurveyUpdateStatus({
        networkAvailable,
        survey,
        surveyName,
        user,
      }),
    );
  }, [networkAvailable, survey, surveyName, user]);

  useEffect(() => {
    void Promise.resolve().then(determineStatus);
  }, [determineStatus]);

  if (!survey) return null;

  return (
    <Card style={styles.container}>
      <VView style={styles.internalContainer} transparent>
        <HView style={styles.surveyTitleContainer} transparent>
          <Text style={styles.surveyTitle} variant="titleMedium">
            {surveyTitle}
          </Text>
          {!isDemoSurvey && (
            <SurveyUpdateStatusIcon
              onPress={determineStatus}
              updateStatus={updateStatus}
              errorKey={errorKey}
            />
          )}
        </HView>
        {surveyDescription && (
          <ViewMoreText numberOfLines={1}>
            <Text variant="titleSmall">{surveyDescription}</Text>
          </ViewMoreText>
        )}
        {fieldManualUrl && (
          <Link labelKey="surveys:fieldManual" url={fieldManualUrl} />
        )}
        <Button
          style={styles.goToDataEntryButton}
          textKey="dataEntry:goToDataEntry"
          onPress={() => navigation.navigate(screenKeys.recordsList as never)}
        />
      </VView>
    </Card>
  );
};
