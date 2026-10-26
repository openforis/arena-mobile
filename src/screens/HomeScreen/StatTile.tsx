import { StyleSheet } from "react-native";

import { Icon, Text, VView } from "components";
import { useEffectiveTheme } from "hooks";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 2,
    paddingVertical: 6,
  },
  value: { fontWeight: "700" },
});

type Props = {
  // used only when value > 0, to draw attention to it
  highlightColor?: string;
  icon: string;
  labelKey: string;
  value: number;
};

export const StatTile = ({ highlightColor, icon, labelKey, value }: Props) => {
  const theme = useEffectiveTheme();
  const color =
    highlightColor && value > 0 ? highlightColor : theme.colors.primary;
  return (
    <VView style={styles.container}>
      <Icon color={color} size={22} source={icon} />
      <Text style={[styles.value, { color }]} variant="headlineSmall">
        {String(value)}
      </Text>
      <Text
        numberOfLines={1}
        style={{ color: theme.colors.onSurfaceVariant }}
        textKey={labelKey}
        variant="labelSmall"
      />
    </VView>
  );
};
