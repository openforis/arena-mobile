import React, { useCallback, useState } from "react";
import { Linking } from "react-native";

import { ChangelogViewDialog } from "appComponents/ChangelogViewDialog";
import { VersionNumberInfoButton } from "appComponents/VersionNumberInfoButton";
import { Button, FormItem, ScreenView, Text, VView } from "components";
import { useTranslation } from "localization";

import styles from "./styles";

const developedBy = "Open Foris Initiative";
const supportEmailAddress = process.env.EXPO_PUBLIC_SUPPORT_EMAIL_ADDRESS;

export const AboutScreen = () => {
  const { t } = useTranslation();

  const [changelogDialogOpen, setChangelogDialogOpen] = useState(false);

  const onSupportPress = useCallback(() => {
    const openSupportEmailParams = new URLSearchParams({
      subject: t("common:appTitle"),
    }).toString();
    Linking.openURL(`mailto:${supportEmailAddress}?${openSupportEmailParams}`);
  }, [t]);

  const toggleChangelogDialogOpen = useCallback(
    () => setChangelogDialogOpen((oldValue) => !oldValue),
    []
  );

  return (
    <ScreenView>
      <VView style={styles.formWrapper}>
        <FormItem labelKey="about:developedBy">{developedBy}</FormItem>
        <FormItem labelKey="about:support">
          <VView>
            <Text
              textKey="about:sendSupportEmailIntroduction"
              variant="labelLarge"
            />
            <Button onPress={onSupportPress}>{supportEmailAddress}</Button>
          </VView>
        </FormItem>
        <FormItem labelKey="about:version">
          <VersionNumberInfoButton />
        </FormItem>
        <FormItem labelKey="app:changelog">
          <Button
            onPress={toggleChangelogDialogOpen}
            mode="text"
            textKey="about:viewChangelog"
          />
          {changelogDialogOpen && (
            <ChangelogViewDialog
              onClose={toggleChangelogDialogOpen}
              showCurrentVersionNumber={false}
            />
          )}
        </FormItem>
      </VView>
    </ScreenView>
  );
};
