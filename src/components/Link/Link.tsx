import { Paragraph } from "react-native-paper";
import * as WebBrowser from "expo-web-browser";

import { useTranslation } from "localization";

import styles from "./styles";
import { useCallback } from "react";
import { Text } from "components/Text";

type Props = {
  labelKey?: string;
  labelParams?: any;
  url: string;
};

export const Link = (props: Props) => {
  const { labelKey, labelParams, url } = props;
  const { t } = useTranslation();

  const onPress = useCallback(async () => {
    await WebBrowser.openBrowserAsync(url);
  }, [url]);

  const label = labelKey ? t(labelKey, labelParams) : url;

  return (
    <Text onPress={onPress} style={styles.paragraph} variant="bodyMedium">
      {label}
    </Text>
  );
};
