import { useNavigation } from "@react-navigation/native";
import { StyleSheet } from "react-native";

import { Button, Text } from "components";

import { screenKeys } from "../screenKeys";
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
  const navigation = useNavigation();

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
          navigation.navigate(screenKeys.surveysListLocal as never)
        }
        style={styles.button}
        textKey="surveys:selectSurvey"
      />
    </HomeBanner>
  );
};
