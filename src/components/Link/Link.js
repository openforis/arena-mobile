import { Paragraph } from "react-native-paper";
import * as WebBrowser from "expo-web-browser";
import PropTypes from "prop-types";

import { useTranslation } from "localization";

import styles from "./styles";

export const Link = (props) => {
  const { labelKey, labelParams, url } = props;
  const { t } = useTranslation();

  const onPress = async () => {
    await WebBrowser.openBrowserAsync(url);
  };

  return (
    <Paragraph style={styles.paragraph} onPress={onPress}>
      {t(labelKey, labelParams)}
    </Paragraph>
  );
};

Link.propTypes = {
  labelKey: PropTypes.string.isRequired,
  labelParams: PropTypes.object,
  url: PropTypes.string.isRequired,
};
