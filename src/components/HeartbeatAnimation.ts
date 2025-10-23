import { Animated } from "react-native";

export const HeartbeatAnimation = ({ value, minValue, maxValue }) =>
  Animated.loop(
    Animated.sequence([
      Animated.timing(value, {
        toValue: maxValue,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: minValue,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: maxValue,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: minValue,
        duration: 2000,
        useNativeDriver: true,
      }),
    ])
  );
