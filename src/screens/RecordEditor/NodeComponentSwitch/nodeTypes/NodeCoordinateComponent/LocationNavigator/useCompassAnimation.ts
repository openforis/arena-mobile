import { useEffect, useRef } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const shortestAngleDelta = (from: number, to: number): number => {
  let d = ((to - from) % 360 + 360) % 360;
  if (d > 180) d -= 360;
  return d;
};

type UseCompassAnimationProps = {
  heading: number;
  relativeAngle: number;
};

export const useCompassAnimation = ({
  heading,
  relativeAngle,
}: UseCompassAnimationProps) => {
  const compassRotSv = useSharedValue(0);
  const arrowRotSv = useSharedValue(0);

  const prevHeadingRef = useRef(heading);
  const prevRelAngleRef = useRef(relativeAngle);

  useEffect(() => {
    const delta = shortestAngleDelta(prevHeadingRef.current, heading);
    prevHeadingRef.current = heading;
    compassRotSv.value = withTiming(compassRotSv.value - delta, {
      duration: 150,
    });
  }, [heading, compassRotSv]);

  useEffect(() => {
    const delta = shortestAngleDelta(prevRelAngleRef.current, relativeAngle);
    prevRelAngleRef.current = relativeAngle;
    arrowRotSv.value = withTiming(arrowRotSv.value + delta, { duration: 150 });
  }, [relativeAngle, arrowRotSv]);

  const compassRotStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${compassRotSv.value}deg` }],
  }));

  const arrowRotStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${arrowRotSv.value}deg` }],
  }));

  return { compassRotStyle, arrowRotStyle };
};
