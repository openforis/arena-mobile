import { useEffect, useRef } from "react";
import { Animated, Image, ImageSourcePropType, StyleProp, ImageStyle } from "react-native";
import { useAssets } from "expo-asset";

import { HeartbeatAnimation } from "components/HeartbeatAnimation";

const defaultStyle = { width: 50, height: 50 };

const animMinScale = 0.8;
const animMaxScale = 1;

type Props = {
  animated?: boolean;
  style?: StyleProp<ImageStyle>;
};

export const AppLogo = (props: Props) => {
  const { animated = false, style } = props;

  const scaleValueRef = useRef(new Animated.Value(1));

  useEffect(() => {
    if (animated) {
      HeartbeatAnimation({
        value: scaleValueRef.current,
        minValue: animMinScale,
        maxValue: animMaxScale,
      }).start();
    }
  }, [animated]);

  const [logoAssets] = useAssets(
    require("../../assets/logo/icon_transparent.png")
  );
  if (!logoAssets) return null;

  const image = (
    <Image
      source={logoAssets as ImageSourcePropType}
      style={[defaultStyle, style]}
    />
  );

  if (animated) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleValueRef.current }] }}>
        {image}
      </Animated.View>
    );
  }
  return image;
};
