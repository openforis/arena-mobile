import { useEffect, useState } from "react";
import { Animated } from "react-native";

type Props = {
  duration?: number;
  visible?: boolean;
  style?: any;
  children?: React.ReactNode;
};

export const Fade = (props: Props) => {
  const {
    duration = 500,
    visible: visibleProp = true,
    style,
    children,
    ...otherProps
  } = props;

  const [animatedValue] = useState(
    () => new Animated.Value(visibleProp ? 1 : 0),
  );
  // shown as soon as visible, hidden at the end of the fade out
  const [childrenVisible, setChildrenVisible] = useState(visibleProp);
  if (visibleProp && !childrenVisible) {
    setChildrenVisible(true);
  }

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: visibleProp ? 1 : 0,
      duration,
      useNativeDriver: true,
    }).start(() => setChildrenVisible(visibleProp));
  }, [animatedValue, duration, visibleProp]);

  const containerStyle = {
    opacity: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: [
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [1.1, 1],
        }),
      },
    ],
  };

  return (
    <Animated.View style={[containerStyle, style]} {...otherProps}>
      {childrenVisible ? children : null}
    </Animated.View>
  );
};
