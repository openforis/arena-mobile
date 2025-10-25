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

  const [state, setState] = useState({
    animatedValue: new Animated.Value(visibleProp ? 1 : 0),
    childrenVisible: visibleProp,
  });
  const { animatedValue, childrenVisible } = state;

  const setChildrenVisible = (value: any) => setState((statePrev) => ({ ...statePrev, childrenVisible: value }));

  useEffect(() => {
    if (visibleProp) {
      setChildrenVisible(true);
    }
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
