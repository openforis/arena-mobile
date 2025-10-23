import * as React from "react";
import { ProgressBar as RNPProgressBar } from "react-native-paper";
import PropTypes from "prop-types";

export const ProgressBar = (props) => {
  const { color, indeterminate = false, progress = 100, style } = props;

  return (
    <RNPProgressBar
      color={color}
      indeterminate={indeterminate}
      progress={progress}
      style={[
        {
          alignSelf: "stretch",
          height: 20,
          margin: 10,
        },
        style,
      ]}
    />
  );
};

ProgressBar.propTypes = {
  color: PropTypes.string,
  indeterminate: PropTypes.bool,
  progress: PropTypes.number,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
