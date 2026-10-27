import React, { useMemo } from "react";
import { StyleProp, TextStyle, ViewStyle } from "react-native";
import { List } from "react-native-paper";

type IconRenderProps = { color: string; style?: StyleProp<ViewStyle> };

// defined outside the component so the render functions aren't nested components
const createIconRenderer =
  // eslint-disable-next-line react/display-name -- a render function, not a component
  (icon: string, iconColor?: string) => (iconProps: IconRenderProps) => (
    <List.Icon
      {...iconProps}
      color={iconColor ?? iconProps.color}
      icon={icon}
    />
  );

const createElementRenderer = (element: React.ReactNode) => () => element;

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

  const left = useMemo(
    () => (leftIcon ? createIconRenderer(leftIcon, leftIconColor) : undefined),
    [leftIcon, leftIconColor],
  );

  const rightRenderer = useMemo(() => {
    if (right !== undefined) return createElementRenderer(right);
    if (rightIcon) return createIconRenderer(rightIcon);
    return undefined;
  }, [right, rightIcon]);

  return (
    <List.Item
      description={description}
      descriptionNumberOfLines={descriptionNumberOfLines}
      left={left}
      onPress={onPress}
      right={rightRenderer}
      style={style}
      title={title}
      titleStyle={titleStyle}
    />
  );
};
