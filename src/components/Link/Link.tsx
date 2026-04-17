import { Objects } from "@openforis/arena-core";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useMemo } from "react";
import type { StyleProp, TextStyle } from "react-native";

import { Text } from "components/Text";
import { useTranslation } from "localization";

import styles from "./styles";

type Props = {
  labelKey?: string;
  labelParams?: any;
  labelIsI18nKey?: boolean;
  style?: StyleProp<TextStyle>;
  textVariant?: "bodyMedium" | "bodyLarge" | "labelMedium" | "labelLarge";
  url: string;
};

export const Link = (props: Props) => {
  const {
    labelKey,
    labelParams,
    labelIsI18nKey = true,
    style: styleProp,
    textVariant = "bodyMedium",
    url,
  } = props;
  const { t } = useTranslation();

  const onPress = useCallback(async () => {
    await WebBrowser.openBrowserAsync(url);
  }, [url]);

  const label = useMemo(() => {
    if (Objects.isNotEmpty(labelKey)) {
      return labelIsI18nKey ? t(labelKey, labelParams) : labelKey;
    }
    return url;
  }, [labelKey, labelParams, labelIsI18nKey, t, url]);

  const style = useMemo(() => [styles.paragraph, styleProp], [styleProp]);

  return (
    <Text onPress={onPress} style={style} variant={textVariant}>
      {label}
    </Text>
  );
};
