import { useMemo } from "react";
import PropTypes from "prop-types";

import { useIsTextDirectionRtl } from "localization";

import { View } from "./View";

const baseStyle = {
  display: "flex",
  flexDirection: "row",
  gap: 4,
};

const rtlStyle = { flexDirection: "row-reverse" };

export const HView = (props) => {
  const {
    children,
    fullWidth = false,
    style: styleProp,
    textDirectionAware = true,
    ...otherProps
  } = props;

  const isRtl = useIsTextDirectionRtl();

  const style = useMemo(
    () => [
      baseStyle,
      textDirectionAware && isRtl ? rtlStyle : undefined,
      styleProp,
    ],
    [isRtl, styleProp, textDirectionAware]
  );

  return (
    <View fullWidth={fullWidth} style={style} {...otherProps}>
      {children}
    </View>
  );
};

HView.propTypes = { ...View.propTypes, textDirectionAware: PropTypes.bool };
