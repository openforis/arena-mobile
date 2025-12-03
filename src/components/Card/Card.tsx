import { Card as RNPCard } from "react-native-paper";

import { useTranslation } from "localization";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";

type Props = {
  children?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  subtitleKey?: string;
  titleKey?: string;
};

const defaultStyles = StyleSheet.create({
  subtitle: {
    textAlign: "justify",
    fontStyle: "italic",
  },
});

export const Card = (props: Props) => {
  const { children, contentStyle, style, subtitleKey, titleKey } = props;

  const { t } = useTranslation();

  const title = titleKey ? t(titleKey) : null;
  const subtitle = subtitleKey ? t(subtitleKey) : null;

  return (
    <RNPCard style={style}>
      {title && (
        <RNPCard.Title
          title={title}
          titleVariant="titleMedium"
          subtitle={subtitle}
          subtitleNumberOfLines={2}
          subtitleStyle={defaultStyles.subtitle}
        />
      )}
      <RNPCard.Content style={contentStyle}>{children}</RNPCard.Content>
    </RNPCard>
  );
};
