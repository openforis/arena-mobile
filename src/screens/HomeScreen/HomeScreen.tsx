import React from "react";
import { useNavigator } from "navigation/navigator";

import { GpsLockingEnabledWarning } from "appComponents/GpsLockingEnabledWarning";
import { VersionNumberInfoButton } from "appComponents/VersionNumberInfoButton";
import { WhatsNewUnseenItemsDialog } from "appComponents/WhatsNew";
import { ScreenView, VView } from "components";

import { PreviewMode } from "utils";
import { HomeAccountItem } from "./HomeAccountItem";
import { HomeListItem } from "./HomeListItem";
import { NoSurveyBanner } from "./NoSurveyBanner";
import { SelectedSurveyBanner } from "./SelectedSurveyBanner";
import { SurveyUpdateProgressDialog } from "./SurveyUpdateProgressDialog";
import { useHomeScreen } from "./useHomeScreen";

import styles from "./styles";

const surveysIconColor = "#7E57C2";
const surveysIconBackgroundColor = "rgba(126, 87, 194, 0.13)";

export const HomeScreen = () => {
  const navigator = useNavigator();

  const {
    surveySelected,
    surveyLoadingDialogTitleKey,
    surveyLoadingDialogVisible,
  } = useHomeScreen();

  return (
    <ScreenView contentContainerStyle={styles.screenContent}>
      {surveyLoadingDialogVisible && (
        <SurveyUpdateProgressDialog titleKey={surveyLoadingDialogTitleKey} />
      )}

      {!PreviewMode.isActive && <WhatsNewUnseenItemsDialog />}

      {surveySelected ? <SelectedSurveyBanner /> : <NoSurveyBanner />}

      <VView style={styles.body}>
        <GpsLockingEnabledWarning />

        <HomeAccountItem />

        <HomeListItem
          descriptionKey="home:surveysDescription"
          icon="folder-swap-outline"
          iconBackgroundColor={surveysIconBackgroundColor}
          iconColor={surveysIconColor}
          onPress={() => navigator.navigateToSurveysListLocal()}
          testID="home-surveys-button"
          titleKey="home:surveys"
        />
      </VView>

      <VView style={styles.footer}>
        <VersionNumberInfoButton />
      </VView>
    </ScreenView>
  );
};
