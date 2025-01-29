import React from "react";
import { useNavigation } from "@react-navigation/native";

import { AppLogo } from "appComponents/AppLogo";
import { GpsLockingEnabledWarning } from "appComponents/GpsLockingEnabledWarning";
import { LoginInfo } from "appComponents/LoginInfo";
import { VersionNumberInfoButton } from "appComponents/VersionNumberInfoButton";
import { Button, ScreenView, Text, VView } from "components";
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

        <Text
          style={styles.appTitle}
          variant="headlineSmall"
          textKey="common:appTitle"
        />

        <VersionNumberInfoButton />

        <LoginInfo />

        <GpsLockingEnabledWarning />

        {surveySelected && <SelectedSurveyContainer />}

        <Button
          mode={surveySelected ? "contained-tonal" : "contained"}
          textKey={
            surveySelected ? "surveys:manageSurveys" : "surveys:selectSurvey"
          }
          style={styles.manageSurveysButton}
          onPress={() => navigation.navigate(screenKeys.surveysListLocal)}
        />
      </VView>
    </ScreenView>
  );
};
