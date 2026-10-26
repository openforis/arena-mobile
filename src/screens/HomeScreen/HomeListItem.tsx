import { Pressable, StyleSheet } from "react-native";

import { Icon, Surface, Text, VView } from "components";
import { useEffectiveTheme } from "hooks";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: { flex: 1 },
  title: { fontWeight: "700" },
});

type Props = {
  description?: string;
  descriptionKey?: string;
  icon: string;
  iconBackgroundColor?: string;
  iconColor?: string;
  onPress?: () => void;
  // shown on the right side; a chevron is shown when not specified and onPress is
  right?: React.ReactNode;
  testID?: string;
  title?: string;
  titleKey?: string;
};

export const HomeListItem = (props: Props) => {
  const {
    description,
    descriptionKey,
    icon,
    iconBackgroundColor,
    iconColor,
    onPress,
    right,
    testID,
    title,
    titleKey,
  } = props;
  const theme = useEffectiveTheme();
  const secondaryColor = theme.colors.onSurfaceVariant;

  const content = (
    <Surface elevation={1} style={styles.container}>
      <VView
        style={[
          styles.iconContainer,
          {
            backgroundColor: iconBackgroundColor ?? theme.colors.surfaceVariant,
          },
        ]}
      >
        <Icon color={iconColor ?? secondaryColor} size={24} source={icon} />
      </VView>
      <VView style={styles.textContainer}>
        <Text style={styles.title} textKey={titleKey} variant="titleSmall">
          {title}
        </Text>
        {(description || descriptionKey) && (
          <Text
            style={{ color: secondaryColor }}
            textKey={descriptionKey}
            variant="bodySmall"
          >
            {description}
          </Text>
        )}
      </VView>
      {right ??
        (onPress && (
          <Icon color={secondaryColor} size={26} source="chevron-right" />
        ))}
    </Surface>
  );

  return onPress ? (
    <Pressable onPress={onPress} testID={testID}>
      {content}
    </Pressable>
  ) : (
    content
  );
};
