import { TouchableOpacity } from "react-native";

import { HView, Icon, Text } from "components";

import styles from "./styles";

export const ExpandableHeader = ({
  expanded,
  iconColor,
  iconSource,
  onPress,
  text,
  textColor,
}: {
  expanded: boolean;
  iconColor?: string;
  iconSource: string;
  onPress: () => void;
  text: string;
  textColor: string;
}) => (
  <TouchableOpacity onPress={onPress}>
    <HView style={styles.header}>
      <Icon source={iconSource} color={iconColor ?? textColor} />
      {/* one line, to take as little space as possible above the form */}
      <Text
        numberOfLines={1}
        style={[styles.headerText, { color: textColor }]}
        variant="labelLarge"
      >
        {text}
      </Text>
      <Icon
        source={expanded ? "chevron-up" : "chevron-down"}
        color={textColor}
        size={24}
      />
    </HView>
  </TouchableOpacity>
);
