import { useEffect, useRef } from "react";
import { Animated, Image } from "react-native";
import { useAssets } from "expo-asset";
import PropTypes from "prop-types";

import { HeartbeatAnimation } from "components/HeartbeatAnimation";

const defaultStyle = { width: 50, height: 50 };

const animMinScale = 0.8;
const animMaxScale = 1;

export const AppLogo = (props) => {
  const { animated = false, style } = props;

  const scaleValueRef = useRef(new Animated.Value(1));

  useEffect(() => {
    HeartbeatAnimation({
      value: scaleValueRef.current,
      minValue: animMinScale,
      maxValue: animMaxScale,
    }).start();
  }, []);

  const [logo] = useAssets(require("../../assets/icon_transparent.png"));

  if (!logo) return null;

  const image = <Image source={logo} style={[defaultStyle, style]} />;

  if (animated) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleValueRef.current }] }}>
        {image}
      </Animated.View>
    );
  }
  return image;
};

AppLogo.propTypes = {
  animated: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
