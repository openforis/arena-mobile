import { useMemo } from "react";
import {
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import { useTranslation } from "localization";

import { HView } from "./HView";
import { Text, TextVariant } from "./Text";

type Props = {
  children?: React.ReactNode;
  labelIcon?: React.ReactNode;
  labelKey: string;
  labelNumberOfLines?: number;
  labelStyle?: StyleProp<TextStyle>;
  labelVariant?: TextVariant;
  style?: StyleProp<ViewStyle>;
  textVariant?: TextVariant;
};

const styles = StyleSheet.create({
  container: { alignItems: "baseline" },
  labelIconWrapper: { alignSelf: "center", marginRight: 4 },
});

export const FormItem = ({
  children,
  labelIcon,
  labelKey,
  labelNumberOfLines = undefined,
  labelStyle = undefined,
  labelVariant = "labelLarge",
  style,
  textVariant = "bodyLarge",
}: Props) => {
  const { t } = useTranslation();
  const label = `${t(labelKey)}:`;
  const containerStyle = useMemo(
    () => (style ? [styles.container, style] : styles.container),
    [style],
  );
  const hasTextContent =
    typeof children === "string" || typeof children === "number";

  return (
    <HView style={containerStyle}>
      {labelIcon && <View style={styles.labelIconWrapper}>{labelIcon}</View>}
      <Text
        numberOfLines={labelNumberOfLines}
        style={labelStyle}
        variant={labelVariant}
      >
        {label}
      </Text>
      {hasTextContent ? (
        <Text variant={textVariant}>{children}</Text>
      ) : (
        children
      )}
    </HView>
  );
};
