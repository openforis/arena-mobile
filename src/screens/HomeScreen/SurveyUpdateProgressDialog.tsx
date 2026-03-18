import { StyleSheet } from "react-native";
import { ActivityIndicator, Dialog, Portal } from "react-native-paper";

import { Text, VView } from "components";
import { useTranslation } from "localization";

const styles = StyleSheet.create({
  content: {
    alignItems: "center",
    gap: 16,
    paddingTop: 8,
  },
});

export const SurveyUpdateProgressDialog = () => {
  const { t } = useTranslation();

  return (
    <Portal>
      <Dialog dismissable={false} visible>
        <Dialog.Title>{t("surveys:updateSurvey")}</Dialog.Title>
        <Dialog.Content>
          <VView style={styles.content} transparent>
            <ActivityIndicator animating size="large" />
            <Text variant="bodyLarge">{t("app:pleaseWaitMessage")}</Text>
          </VView>
        </Dialog.Content>
      </Dialog>
    </Portal>
  );
};
