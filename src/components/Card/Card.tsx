import { Card as RNPCard } from "react-native-paper";

import { useTranslation } from "localization";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";

type TitleVariant = "titleSmall" | "titleMedium" | "titleLarge";

type Props = {
  children?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  subtitleKey?: string;
  // plain text title (used when titleKey is not specified)
  title?: string;
  // translation key of the title
  titleKey?: string;
  titleVariant?: TitleVariant;
};

const defaultStyles = StyleSheet.create({
  subtitle: {
    textAlign: "justify",
    fontStyle: "italic",
  },
});

export const Card = (props: Props) => {
  const {
    children,
    contentStyle,
    onPress,
    style,
    subtitleKey,
    title: titleProp,
    titleKey,
    titleVariant = "titleMedium",
  } = props;

  const { t } = useTranslation();

  const title = titleKey ? t(titleKey) : (titleProp ?? null);
  const subtitle = subtitleKey ? t(subtitleKey) : null;

  return (
    <RNPCard onPress={onPress} style={style}>
      {title && (
        <RNPCard.Title
          title={title}
          titleVariant={titleVariant}
          subtitle={subtitle}
          subtitleNumberOfLines={2}
          subtitleStyle={defaultStyles.subtitle}
        />
      )}
      <RNPCard.Content style={contentStyle}>{children}</RNPCard.Content>
    </RNPCard>
  );
};
