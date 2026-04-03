import { useEffect, useState } from "react";
import { Animated } from "react-native";

import { HeartbeatAnimation } from "components/HeartbeatAnimation";

type UseHeartbeatAnimationParams = {
  isActive: boolean;
  initialValue?: number;
  maxValue?: number;
  minValue?: number;
};

export const useHeartbeatAnimation = ({
  isActive,
  initialValue = 1,
  maxValue = 1,
  minValue = 0.25,
}: UseHeartbeatAnimationParams): Animated.Value => {
  const [animatedValue] = useState(() => new Animated.Value(initialValue));

  useEffect(() => {
    if (isActive) {
      const animation = HeartbeatAnimation({
        value: animatedValue,
        minValue,
        maxValue,
      });
      animation.start();
      return () => animation.stop();
    }

    animatedValue.stopAnimation();
    animatedValue.setValue(initialValue);
    return undefined;
  }, [animatedValue, initialValue, isActive, maxValue, minValue]);

  return animatedValue;
};
