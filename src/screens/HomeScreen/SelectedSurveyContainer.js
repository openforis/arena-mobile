import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";

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

export const SelectedSurveyContainer = () => {
  const navigation = useNavigation();
  const networkAvailable = useIsNetworkConnected();
  const user = RemoteConnectionSelectors.useLoggedInUser();

  const survey = SurveySelectors.useCurrentSurvey();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();

  const surveyName = Surveys.getName(survey);
  const surveyLabelInDefaultLanguage = Surveys.getLabel(lang)(survey);
  const surveyTitle = surveyLabelInDefaultLanguage
    ? `${surveyLabelInDefaultLanguage} [${surveyName}]`
    : surveyName;
  const surveyDescription = Surveys.getDescription(lang)(survey);
  const fieldManualUrl = Surveys.getFieldManualLink(lang)(survey);

  const [updateStatus, setUpdateStatus] = useState(UpdateStatus.loading);

  useEffect(() => {
    const determineStatus = async () => {
      if (!user) {
        return UpdateStatus.error;
      }
      const surveyRemote = await SurveyService.fetchSurveySummaryRemote({
        id: survey.remoteId,
        name: surveyName,
      });
      if (!surveyRemote) {
        return SurveyStatus.notInArenaServer;
      } else if (surveyRemote.errorKey) {
        return UpdateStatus.error;
      } else if (!Surveys.isVisibleInMobile(surveyRemote)) {
        return SurveyStatus.notVisibleInMobile;
      } else if (
        Dates.isAfter(
          surveyRemote?.datePublished ?? surveyRemote?.dateModified,
          survey.datePublished ?? survey.dateModified
        )
      ) {
        return UpdateStatus.notUpToDate;
      } else {
        return UpdateStatus.upToDate;
      }
    };
    if (!networkAvailable) {
      setUpdateStatus(UpdateStatus.networkNotAvailable);
    } else if (survey) {
      setUpdateStatus(determineStatus());
    }
  }, [networkAvailable, survey, surveyName, user]);

  if (!survey) return null;

  return (
    <Card style={styles.container}>
      <VView style={styles.internalContainer} transparent>
        <HView style={styles.surveyTitleContainer} transparent>
          <Text style={styles.surveyTitle} variant="titleMedium">
            {surveyTitle}
          </Text>
          <SurveyUpdateStatusIcon updateStatus={updateStatus} />
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
          onPress={() => navigation.navigate(screenKeys.recordsList)}
        />
      </VView>
    </Card>
  );
};
