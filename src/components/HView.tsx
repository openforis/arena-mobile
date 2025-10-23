import { useMemo } from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

// @ts-expect-error TS(2307): Cannot find module 'localization' or its correspon... Remove this comment to see the full error message
import { useIsTextDirectionRtl } from "localization";

import { View } from "./View";

const baseStyle = {
  display: "flex",
  flexDirection: "row",
  gap: 4,
};

const rtlStyle = { flexDirection: "row-reverse" };

export const HView = (props: any) => {
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
