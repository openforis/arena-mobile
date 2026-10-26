import React from "react";
import { StyleProp, TextStyle, ViewStyle } from "react-native";
import { List } from "react-native-paper";

type Props = {
  description?: string;
  descriptionNumberOfLines?: number;
  leftIcon?: string;
  leftIconColor?: string;
  onPress?: () => void;
  // custom element rendered on the right (rightIcon is ignored when specified)
  right?: React.ReactNode;
  rightIcon?: string;
  style?: StyleProp<ViewStyle>;
  title: string;
  titleStyle?: StyleProp<TextStyle>;
};

export const ListItem = (props: Props) => {
  const {
    description,
    descriptionNumberOfLines,
    leftIcon,
    leftIconColor,
    onPress,
    right,
    rightIcon,
    style,
    title,
    titleStyle,
  } = props;

  return (
    <List.Item
      description={description}
      descriptionNumberOfLines={descriptionNumberOfLines}
      left={
        leftIcon
          ? (leftProps) => (
              <List.Icon {...leftProps} color={leftIconColor} icon={leftIcon} />
            )
          : undefined
      }
      onPress={onPress}
      right={
        right !== undefined
          ? () => right
          : rightIcon
            ? (rightProps) => <List.Icon {...rightProps} icon={rightIcon} />
            : undefined
      }
      style={style}
      title={title}
      titleStyle={titleStyle}
    />
  );
};
