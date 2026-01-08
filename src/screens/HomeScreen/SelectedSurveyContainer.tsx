import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";

import { Dates, Surveys } from "@openforis/arena-core";

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

  const [state, setState] = useState({
    updateStatus: UpdateStatus.loading,
    errorKey: null,
  } as SelectedSurveyContainerState);
  const { updateStatus, errorKey } = state;

  const determineStatus = useCallback(async () => {
    if (!survey) {
      return;
    }
    if (!user) {
      setState({ updateStatus: UpdateStatus.error });
      return;
    }
    if (!networkAvailable) {
      setState({ updateStatus: UpdateStatus.networkNotAvailable });
      return;
    }
    const surveyRemote = await SurveyService.fetchSurveySummaryRemote({
      id: survey.remoteId,
      name: surveyName,
    });
    if (!surveyRemote) {
      setState({ updateStatus: SurveyStatus.notInArenaServer });
    } else if (surveyRemote.errorKey) {
      setState({
        updateStatus: UpdateStatus.error,
        errorKey: surveyRemote.errorKey,
      });
    } else if (!Surveys.isVisibleInMobile(surveyRemote)) {
      setState({ updateStatus: SurveyStatus.notVisibleInMobile });
    } else if (
      Dates.isAfter(
        surveyRemote?.datePublished ?? surveyRemote?.dateModified,
        // @ts-ignore
        survey.datePublished ?? survey.dateModified
      )
    ) {
      setState({ updateStatus: UpdateStatus.notUpToDate });
    } else {
      setState({ updateStatus: UpdateStatus.upToDate });
    }
  }, [networkAvailable, survey, surveyName, user]);

  useEffect(() => {
    determineStatus();
  }, [determineStatus]);

  if (!survey) return null;

  return (
    <Card style={styles.container}>
      <VView style={styles.internalContainer} transparent>
        <HView style={styles.surveyTitleContainer} transparent>
          <Text style={styles.surveyTitle} variant="titleMedium">
            {surveyTitle}
          </Text>
          {SurveyService.demoSurveyUuid !== survey.uuid && (
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
