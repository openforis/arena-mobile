import { useEffect, useRef } from "react";
import { Animated, Image } from "react-native";
import { useAssets } from "expo-asset";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { HeartbeatAnimation } from "components/HeartbeatAnimation";

const defaultStyle = { width: 50, height: 50 };

const animMinScale = 0.8;
const animMaxScale = 1;

export const AppLogo = (props: any) => {
  const { animated = false, style } = props;

  const scaleValueRef = useRef(new Animated.Value(1));

  useEffect(() => {
    HeartbeatAnimation({
      value: scaleValueRef.current,
      minValue: animMinScale,
      maxValue: animMaxScale,
    }).start();
  }, []);

  const [logo] = useAssets(require("../../assets/logo/icon_transparent.png"));

  if (!logo) return null;

  // @ts-expect-error TS(2769): No overload matches this call.
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
