import { useNavigator } from "navigation/navigator";
import { StyleSheet } from "react-native";

import { Button, Text } from "components";

import {
  bannerSecondaryTextColor,
  bannerTextColor,
  HomeBanner,
} from "./HomeBanner";

const styles = StyleSheet.create({
  title: { color: bannerTextColor, fontWeight: "700" },
  description: { color: bannerSecondaryTextColor },
  button: { backgroundColor: "white", paddingVertical: 4 },
});

export const NoSurveyBanner = () => {
  const navigator = useNavigator();

  return (
    <HomeBanner
      header={
        <>
          <Text
            style={styles.title}
            textKey="home:noSurveySelected"
            variant="titleLarge"
          />
          <Text
            style={styles.description}
            textKey="home:noSurveySelectedDescription"
            variant="bodySmall"
          />
        </>
      }
    >
      <Button
        icon="folder-download-outline"
        labelVariant="bodyLarge"
        mode="outlined"
        onPress={() =>
          navigator.navigateToSurveysListLocal()
        }
        style={styles.button}
        textKey="surveys:selectSurvey"
      />
    </HomeBanner>
  );
};
