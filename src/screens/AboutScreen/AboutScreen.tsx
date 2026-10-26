import React, { useCallback, useState } from "react";
import { Linking } from "react-native";
import { List, Surface } from "react-native-paper";
import * as WebBrowser from "expo-web-browser";

import { Objects } from "@openforis/arena-core";

import { AppLogo } from "appComponents/AppLogo";
import { ChangelogViewDialog } from "appComponents/ChangelogViewDialog";
import { VersionNumberInfoButton } from "appComponents/VersionNumberInfoButton";
import { WhatsNewAllItemsDialog } from "appComponents/WhatsNew";
import { Divider, HView, Link, ScreenView, Text, VView } from "components";
import { useTranslation } from "localization";
import { AMConstants } from "utils";

import { AboutListItem } from "./AboutListItem";
import styles from "./styles";

const supportEmailAddress = process.env.EXPO_PUBLIC_SUPPORT_EMAIL_ADDRESS;

// show only the host: the full forum url is too long for small screens
const supportForumHost = AMConstants.supportForumUrl.replace(
  /^https?:\/\/([^/]+).*$/,
  "$1",
);

export const AboutScreen = () => {
  const { t } = useTranslation();

  const [changelogDialogOpen, setChangelogDialogOpen] = useState(false);
  const [whatsNewDialogOpen, setWhatsNewDialogOpen] = useState(false);

  const onSupportEmailPress = useCallback(() => {
    const openSupportEmailParams = new URLSearchParams({
      subject: t("common:appTitle"),
    }).toString();
    Linking.openURL(`mailto:${supportEmailAddress}?${openSupportEmailParams}`);
  }, [t]);

  const onSupportForumPress = useCallback(async () => {
    await WebBrowser.openBrowserAsync(AMConstants.supportForumUrl);
  }, []);

  const toggleChangelogDialogOpen = useCallback(
    () => setChangelogDialogOpen((oldValue) => !oldValue),
    [],
  );

  const toggleWhatsNewDialogOpen = useCallback(
    () => setWhatsNewDialogOpen((oldValue) => !oldValue),
    [],
  );

  return (
    <ScreenView contentContainerStyle={styles.screenContent}>
      <VView style={styles.header}>
        <AppLogo style={styles.logo} />
        <Text variant="titleLarge" style={styles.appName}>
          {AMConstants.appNameFull}
        </Text>
        <VersionNumberInfoButton />
      </VView>

      <Surface style={styles.section} elevation={1}>
        <List.Subheader style={styles.sectionTitle}>
          {t("about:support")}
        </List.Subheader>
        {Objects.isNotEmpty(supportEmailAddress) && (
          <>
            <AboutListItem
              icon="email-outline"
              titleKey="about:supportEmail"
              description={supportEmailAddress!}
              onPress={onSupportEmailPress}
              external
            />
            <Divider />
          </>
        )}
        <AboutListItem
          icon="forum-outline"
          titleKey="about:supportForum"
          description={supportForumHost}
          onPress={onSupportForumPress}
          external
        />
      </Surface>

      <Surface style={styles.section} elevation={1}>
        <List.Subheader style={styles.sectionTitle}>
          {t("about:releaseNotes")}
        </List.Subheader>
        <AboutListItem
          icon="star-four-points-outline"
          titleKey="whatsNew:title"
          description={t("about:whatsNewDescription")}
          onPress={toggleWhatsNewDialogOpen}
        />
        <Divider />
        <AboutListItem
          icon="history"
          titleKey="app:changelog"
          description={t("about:changelogDescription")}
          onPress={toggleChangelogDialogOpen}
        />
      </Surface>

      <HView style={styles.footer}>
        <Text variant="bodySmall" textKey="about:developedBy" />
        <Link
          labelKey={AMConstants.openForisInitiative}
          labelIsI18nKey={false}
          style={styles.footerLink}
          textVariant="labelMedium"
          url={AMConstants.openForisInitiativeUrl}
        />
      </HView>

      {whatsNewDialogOpen && (
        <WhatsNewAllItemsDialog onClose={toggleWhatsNewDialogOpen} />
      )}
      {changelogDialogOpen && (
        <ChangelogViewDialog
          onClose={toggleChangelogDialogOpen}
          showCurrentVersionNumber={false}
        />
      )}
    </ScreenView>
  );
};
