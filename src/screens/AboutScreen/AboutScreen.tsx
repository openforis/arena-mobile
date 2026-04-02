import React, { useCallback, useState } from "react";
import { Linking } from "react-native";

import { Objects } from "@openforis/arena-core";

import { ChangelogViewDialog } from "appComponents/ChangelogViewDialog";
import { VersionNumberInfoButton } from "appComponents/VersionNumberInfoButton";
import { Button, FormItem, Link, ScreenView, VView } from "components";
import { useTranslation } from "localization";
import { AMConstants } from "utils";

import styles from "./styles";

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
    [],
  );

  return (
    <ScreenView>
      <VView style={styles.formWrapper}>
        <FormItem labelKey="about:developedBy">
          <Link
            labelKey={AMConstants.openForisInitiative}
            labelIsI18nKey={false}
            style={styles.link}
            url={AMConstants.openForisInitiativeUrl}
          />
        </FormItem>
        {Objects.isNotEmpty(supportEmailAddress) && (
          <FormItem labelKey="about:supportEmail">
            <Button mode="text" onPress={onSupportPress}>
              {supportEmailAddress}
            </Button>
          </FormItem>
        )}
        <FormItem labelKey="about:supportForum">
          <Link style={styles.link} url={AMConstants.supportForumUrl} />
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
