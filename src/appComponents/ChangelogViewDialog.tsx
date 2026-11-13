import { useEffect, useMemo, useState } from "react";
import { StyleSheet } from "react-native";

import { Dialog, Markdown } from "components";
import { FormItem } from "components/FormItem";
import { LoadingIcon } from "components/LoadingIcon";
import { ScrollView } from "components/ScrollView";
import { VView } from "components/VView";
import { API } from "service/api";
import { useAppTheme } from "theme";
import { log } from "utils/Logger";
import { VersionNumberInfoText } from "./VersionNumberInfoText";

const changelogUrl =
  "https://raw.githubusercontent.com/openforis/arena-mobile/master/";
const changelogUri = "CHANGELOG.md";

// fetched once per app session (on success)
let changelogContent: string | null = null;
let changelogFetchPromise: Promise<string> | null = null;

const fetchChangelog = (): Promise<string> => {
  changelogFetchPromise ??= API.getFileAsText({
    serverUrl: changelogUrl,
    uri: changelogUri,
  }).then(
    (text) => {
      changelogContent = text;
      return text;
    },
    (error) => {
      changelogFetchPromise = null;
      throw error;
    },
  );
  return changelogFetchPromise;
};

type ChangelogViewDialogProps = {
  onClose: () => void;
  onUpdate?: () => void;
  showCurrentVersionNumber?: boolean;
  title?: string;
};

export const ChangelogViewDialog = (props: ChangelogViewDialogProps) => {
  const {
    onClose,
    onUpdate = null,
    showCurrentVersionNumber = true,
    title = undefined,
  } = props;

  const theme = useAppTheme();
  const [content, setContent] = useState(changelogContent);

  const styles: any = useMemo(
    () =>
      StyleSheet.create({
        formItem: { backgroundColor: "transparent" },
        // fill the safe area height instead of a fixed window fraction
        dialog: { flex: 1, marginVertical: 24 },
        content: {
          flex: 1,
          backgroundColor: theme.colors.surfaceVariant,
        },
        changelogContent: { flex: 1 as const },
      } as any),
    [theme],
  );

  useEffect(() => {
    if (changelogContent) return;
    let cancelled = false;
    fetchChangelog()
      .then((text) => {
        if (!cancelled) setContent(text);
      })
      .catch((error) => log.error("Error fetching the changelog", error));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Dialog
      actions={onUpdate ? [{ onPress: onUpdate, textKey: "app:update" }] : []}
      onClose={onClose}
      style={styles.dialog}
      title={title}
    >
      <VView style={styles.content}>
        {showCurrentVersionNumber && (
          <FormItem labelKey="app:currentVersion" style={styles.formItem}>
            <VersionNumberInfoText includeUpdateTime={false} />
          </FormItem>
        )}
        {!content && <LoadingIcon />}
        {content && (
          <ScrollView style={styles.changelogContent} persistentScrollbar>
            <Markdown content={content} />
          </ScrollView>
        )}
      </VView>
    </Dialog>
  );
};
