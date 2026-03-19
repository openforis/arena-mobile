import React from "react";
import { useNavigation } from "@react-navigation/native";

import { AppLogo } from "appComponents/AppLogo";
import { GpsLockingEnabledWarning } from "appComponents/GpsLockingEnabledWarning";
import { LoginInfo } from "appComponents/LoginInfo";
import { VersionNumberInfoButton } from "appComponents/VersionNumberInfoButton";
import { Button, ScreenView, VView } from "components";

import { RemoteConnectionSelectors } from "state/remoteConnection";
import { screenKeys } from "../screenKeys";
import { SelectedSurveyContainer } from "./SelectedSurveyContainer";
import { SurveyUpdateProgressDialog } from "./SurveyUpdateProgressDialog";
import { useHomeScreen } from "./useHomeScreen";

import styles from "./styles";

export const HomeScreen = () => {
  const navigation = useNavigation();
  const user = RemoteConnectionSelectors.useLoggedInUser();

  const { surveySelected, surveyUpdateLoading } = useHomeScreen();

  return (
    <ScreenView>
      <VView style={styles.container}>
        {surveyUpdateLoading && <SurveyUpdateProgressDialog />}

        <AppLogo />

        <VersionNumberInfoButton />

        <LoginInfo />

        <GpsLockingEnabledWarning />

        {surveySelected && <SelectedSurveyContainer />}

        <Button
          color={surveySelected || !user ? "secondary" : "primary"}
          textKey={
            surveySelected ? "surveys:manageSurveys" : "surveys:selectSurvey"
          }
          style={styles.manageSurveysButton}
          onPress={() =>
            navigation.navigate(screenKeys.surveysListLocal as never)
          }
        />
      </VView>
    </ScreenView>
  );
};
