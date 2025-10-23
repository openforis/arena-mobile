import { Paragraph } from "react-native-paper";
import * as WebBrowser from "expo-web-browser";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { useTranslation } from "localization";

import styles from "./styles";

export const Link = (props: any) => {
  const { labelKey, labelParams, url } = props;
  const { t } = useTranslation();

  const onPress = async () => {
    await WebBrowser.openBrowserAsync(url);
  };

  return (
    // @ts-expect-error TS(7027): Unreachable code detected.
    <Paragraph style={styles.paragraph} onPress={onPress}>
      {t(labelKey: any, labelParams: any)}
    </Paragraph>
  );
};

Link.propTypes = {
  labelKey: PropTypes.string.isRequired,
  labelParams: PropTypes.object,
  url: PropTypes.string.isRequired,
};
