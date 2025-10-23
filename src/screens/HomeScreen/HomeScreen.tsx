import React from "react";
import { useNavigation } from "@react-navigation/native";

import { AppLogo } from "appComponents/AppLogo";
import { GpsLockingEnabledWarning } from "appComponents/GpsLockingEnabledWarning";
import { LoginInfo } from "appComponents/LoginInfo";
import { VersionNumberInfoButton } from "appComponents/VersionNumberInfoButton";
import { Button, ScreenView, VView } from "components";
import { SurveySelectors } from "state";

import { screenKeys } from "../screenKeys";
import { SelectedSurveyContainer } from "./SelectedSurveyContainer";

import styles from "./styles";

export const HomeScreen = () => {
  const navigation = useNavigation();
  const survey = SurveySelectors.useCurrentSurvey();

  const surveySelected = !!survey;

  return (
    // @ts-expect-error TS(2786): 'ScreenView' cannot be used as a JSX component.
    <ScreenView>
      <VView style={styles.container}>
        <AppLogo />

        <VersionNumberInfoButton />

        <LoginInfo />

        // @ts-expect-error TS(2786): 'GpsLockingEnabledWarning' cannot be used as a JSX... Remove this comment to see the full error message
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
