import { useEffect, useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import Markdown from "react-native-markdown-display";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { Dialog } from "components/Dialog";
import { FormItem } from "components/FormItem";
import { LoadingIcon } from "components/LoadingIcon";
import { ScrollView } from "components/ScrollView";
import { VView } from "components/VView";
import { API } from "service/api";
import { VersionNumberInfoText } from "./VersionNumberInfoText";

const changelogUrl =
  "https://raw.githubusercontent.com/openforis/arena-mobile/master/";
const changelogUri = "CHANGELOG.md";

export const ChangelogViewDialog = (props: any) => {
  const {
    onClose,
    onUpdate = null,
    showCurrentVersionNumber = true,
    title = "app:changelog",
  } = props;

  const theme = useTheme();
  const [content, setContent] = useState(null);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        formItem: { backgroundColor: "transparent" },
        markdown: {
          // @ts-expect-error TS(2322): Type '{ body: { color: string; backgroundColor: st... Remove this comment to see the full error message
          body: {
            color: theme.colors.onBackground,
            backgroundColor: theme.colors.surfaceVariant,
          },
        },
        dialog: { display: "flex", height: "90%", padding: 5 },
        content: {
          display: "flex",
          height: "80%",
          gap: 20,
          backgroundColor: theme.colors.surfaceVariant,
        },
        changelogContent: { flex: 1 },
      }),
    [theme]
  );

  useEffect(() => {
    // @ts-expect-error TS(2554): Expected 4 arguments, but got 2.
    API.getFileAsText(changelogUrl, changelogUri).then((text) => {
      setContent(text);
    });
  }, []);

  return (
    // @ts-expect-error TS(2786): 'Dialog' cannot be used as a JSX component.
    <Dialog
      actions={onUpdate ? [{ onPress: onUpdate, textKey: "app:update" }] : []}
      onClose={onClose}
      style={styles.dialog}
      title={title}
    >
      <VView style={styles.content}>
        {showCurrentVersionNumber && (
          // @ts-expect-error TS(2786): 'FormItem' cannot be used as a JSX component.
          <FormItem labelKey="app:currentVersion" style={styles.formItem}>
            <VersionNumberInfoText includeUpdateTime={false} />
          </FormItem>
        )}
        {!content && <LoadingIcon />}
        {content && (
          // @ts-expect-error TS(2322): Type '{ children: Element; style: ViewStyle | Text... Remove this comment to see the full error message
          <ScrollView style={styles.changelogContent} persistentScrollbar>
            // @ts-expect-error TS(2769): No overload matches this call.
            <Markdown style={styles.markdown}>{content}</Markdown>
          </ScrollView>
        )}
      </VView>
    </Dialog>
  );
};

ChangelogViewDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func,
  showCurrentVersionNumber: PropTypes.bool,
  title: PropTypes.string,
};
