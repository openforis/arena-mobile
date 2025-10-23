import { useEffect, useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import Markdown from "react-native-markdown-display";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

// @ts-expect-error TS(2307): Cannot find module 'components/Dialog' or its corr... Remove this comment to see the full error message
import { Dialog } from "components/Dialog";
// @ts-expect-error TS(2307): Cannot find module 'components/FormItem' or its co... Remove this comment to see the full error message
import { FormItem } from "components/FormItem";
// @ts-expect-error TS(2307): Cannot find module 'components/LoadingIcon' or its... Remove this comment to see the full error message
import { LoadingIcon } from "components/LoadingIcon";
// @ts-expect-error TS(2307): Cannot find module 'components/ScrollView' or its ... Remove this comment to see the full error message
import { ScrollView } from "components/ScrollView";
// @ts-expect-error TS(2307): Cannot find module 'components/VView' or its corre... Remove this comment to see the full error message
import { VView } from "components/VView";
// @ts-expect-error TS(2307): Cannot find module 'service/api' or its correspond... Remove this comment to see the full error message
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
    API.getFileAsText(changelogUrl, changelogUri).then((text: any) => {
      setContent(text);
    });
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
