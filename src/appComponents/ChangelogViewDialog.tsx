import { useEffect, useMemo, useState } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { useTheme } from "react-native-paper";

import { Dialog, Markdown } from "components";
import { FormItem } from "components/FormItem";
import { LoadingIcon } from "components/LoadingIcon";
import { ScrollView } from "components/ScrollView";
import { VView } from "components/VView";
import { API } from "service/api";
import { VersionNumberInfoText } from "./VersionNumberInfoText";

const changelogUrl =
  "https://raw.githubusercontent.com/openforis/arena-mobile/master/";
const changelogUri = "CHANGELOG.md";

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

  const theme = useTheme();
  const { height: windowHeight } = useWindowDimensions();
  const [content, setContent] = useState(null);

  const styles: any = useMemo(
    () =>
      StyleSheet.create({
        formItem: { backgroundColor: "transparent" },
        dialog: { height: windowHeight * 0.9 },
        content: {
          flex: 1,
          backgroundColor: theme.colors.surfaceVariant,
        },
        changelogContent: { flex: 1 as const },
      } as any),
    [theme, windowHeight],
  );

  useEffect(() => {
    API.getFileAsText({ serverUrl: changelogUrl, uri: changelogUri }).then(
      (text) => {
        setContent(text);
      },
    );
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
          <ScrollView
            style={styles.changelogContent}
            persistentScrollbar
            transparent
          >
            <Markdown content={content} />
          </ScrollView>
        )}
      </VView>
    </Dialog>
  );
};
