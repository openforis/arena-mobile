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
// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
} from "components";
// @ts-expect-error TS(2307): Cannot find module 'hooks' or its corresponding ty... Remove this comment to see the full error message
import { useIsNetworkConnected } from "hooks";
// @ts-expect-error TS(2307): Cannot find module 'model' or its corresponding ty... Remove this comment to see the full error message
import { SurveyStatus, UpdateStatus } from "model";
// @ts-expect-error TS(2307): Cannot find module 'service' or its corresponding ... Remove this comment to see the full error message
import { SurveyService } from "service";
// @ts-expect-error TS(2307): Cannot find module 'state' or its corresponding ty... Remove this comment to see the full error message
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

  const [state, setState] = useState({
    updateStatus: UpdateStatus.loading,
    errorKey: null,
  });
  const { updateStatus, errorKey } = state;

  const determineStatus = useCallback(async () => {
    if (!survey) {
      return;
    }
    if (!user) {
      // @ts-expect-error TS(2345): Argument of type '{ updateStatus: any; }' is not a... Remove this comment to see the full error message
      setState({ updateStatus: UpdateStatus.error });
      return;
    }
    if (!networkAvailable) {
      // @ts-expect-error TS(2345): Argument of type '{ updateStatus: any; }' is not a... Remove this comment to see the full error message
      setState({ updateStatus: UpdateStatus.networkNotAvailable });
      return;
    }
    const surveyRemote = await SurveyService.fetchSurveySummaryRemote({
      id: survey.remoteId,
      name: surveyName,
    });
    if (!surveyRemote) {
      // @ts-expect-error TS(2345): Argument of type '{ updateStatus: any; }' is not a... Remove this comment to see the full error message
      setState({ updateStatus: SurveyStatus.notInArenaServer });
    } else if (surveyRemote.errorKey) {
      setState({
        updateStatus: UpdateStatus.error,
        errorKey: surveyRemote.errorKey,
      });
    } else if (!Surveys.isVisibleInMobile(surveyRemote)) {
      // @ts-expect-error TS(2345): Argument of type '{ updateStatus: any; }' is not a... Remove this comment to see the full error message
      setState({ updateStatus: SurveyStatus.notVisibleInMobile });
    } else if (
      Dates.isAfter(
        surveyRemote?.datePublished ?? surveyRemote?.dateModified,
        survey.datePublished ?? survey.dateModified
      )
    ) {
      // @ts-expect-error TS(2345): Argument of type '{ updateStatus: any; }' is not a... Remove this comment to see the full error message
      setState({ updateStatus: UpdateStatus.notUpToDate });
    } else {
      // @ts-expect-error TS(2345): Argument of type '{ updateStatus: any; }' is not a... Remove this comment to see the full error message
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
          <SurveyUpdateStatusIcon
            onPress={determineStatus}
            updateStatus={updateStatus}
            errorKey={errorKey}
          />
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
          // @ts-expect-error TS(2769): No overload matches this call.
          onPress={() => navigation.navigate(screenKeys.recordsList)}
        />
      </VView>
    </Card>
  );
};
