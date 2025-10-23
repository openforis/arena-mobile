import React, { useMemo } from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

// @ts-expect-error TS(2307): Cannot find module 'localization' or its correspon... Remove this comment to see the full error message
import { useIsTextDirectionRtl } from "localization";
// @ts-expect-error TS(2307): Cannot find module 'utils' or its corresponding ty... Remove this comment to see the full error message
import { BaseStyles } from "utils";

import { View } from "./View";

const baseStyle = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  alignItems: "center",
  columnGap: 10,
};

export const FlexWrapView = (props: any) => {
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
