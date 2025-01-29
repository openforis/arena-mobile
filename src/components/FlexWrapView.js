import React, { useMemo } from "react";
import PropTypes from "prop-types";

import { useIsTextDirectionRtl } from "localization";
import { BaseStyles } from "utils";

import { View } from "./View";

const baseStyle = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  alignItems: "center",
  columnGap: 10,
};

export const FlexWrapView = (props) => {
  const { children, style: styleProp = {}, ...otherProps } = props;

  const isRtl = useIsTextDirectionRtl();

  const style = useMemo(() => {
    const _style = [baseStyle];
    if (isRtl) {
      _style.push(BaseStyles.flexDirectionRowReverse);
    }
    _style.push(styleProp);
    return _style;
  }, [isRtl, styleProp]);

  return (
    <View style={style} {...otherProps}>
      {children}
    </View>
  );
};

FlexWrapView.propTypes = {
  children: PropTypes.node,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
