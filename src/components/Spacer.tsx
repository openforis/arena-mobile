import { useMemo } from "react";
import PropTypes from "prop-types";

import { View } from "./View";

export const Spacer = (props) => {
  const { fullFlex = true, fullWidth = true, width = undefined } = props;

  const style = useMemo(() => (width ? { width } : undefined), [width]);

  return (
    <View
      fullFlex={fullFlex && !width}
      fullWidth={fullWidth && !width}
      style={style}
      transparent
    />
  );
};

Spacer.propTypes = {
  fullFlex: PropTypes.bool,
  fullWidth: PropTypes.bool,
  width: PropTypes.number,
};
