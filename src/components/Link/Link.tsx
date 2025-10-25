import { Paragraph } from "react-native-paper";
import * as WebBrowser from "expo-web-browser";

import { useTranslation } from "localization";

import styles from "./styles";

type Props = {
  labelKey: string;
  labelParams?: any;
  url: string;
};

export const Link = (props: Props) => {
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
