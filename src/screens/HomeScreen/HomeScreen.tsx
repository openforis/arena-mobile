import React from "react";
import { useNavigation } from "@react-navigation/native";

// @ts-expect-error TS(2307): Cannot find module 'appComponents/AppLogo' or its ... Remove this comment to see the full error message
import { AppLogo } from "appComponents/AppLogo";
// @ts-expect-error TS(2307): Cannot find module 'appComponents/GpsLockingEnable... Remove this comment to see the full error message
import { GpsLockingEnabledWarning } from "appComponents/GpsLockingEnabledWarning";
// @ts-expect-error TS(2307): Cannot find module 'appComponents/LoginInfo' or it... Remove this comment to see the full error message
import { LoginInfo } from "appComponents/LoginInfo";
// @ts-expect-error TS(2307): Cannot find module 'appComponents/VersionNumberInf... Remove this comment to see the full error message
import { VersionNumberInfoButton } from "appComponents/VersionNumberInfoButton";
// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { Button, ScreenView, VView } from "components";
// @ts-expect-error TS(2307): Cannot find module 'state' or its corresponding ty... Remove this comment to see the full error message
import { SurveySelectors } from "state";

import { screenKeys } from "../screenKeys";
import { SelectedSurveyContainer } from "./SelectedSurveyContainer";

import styles from "./styles";

export const HomeScreen = () => {
  const navigation = useNavigation();
  const survey = SurveySelectors.useCurrentSurvey();

  const surveySelected = !!survey;

  return (
    <ScreenView>
      <VView style={styles.container}>
        <AppLogo />

        <VersionNumberInfoButton />

        <LoginInfo />

        <GpsLockingEnabledWarning />

        {surveySelected && <SelectedSurveyContainer />}

        <Button
          color={surveySelected ? "secondary" : "primary"}
          textKey={
            surveySelected ? "surveys:manageSurveys" : "surveys:selectSurvey"
          }
          style={styles.manageSurveysButton}
          // @ts-expect-error TS(2769): No overload matches this call.
          onPress={() => navigation.navigate(screenKeys.surveysListLocal)}
        />
      </VView>
    </ScreenView>
  );
};
