import * as React from "react";
import { Switch as RNPSwitch } from "react-native-paper";
import PropTypes from "prop-types";

export const Switch = (props) => {
  const { onChange, value } = props;

  const onValueChange = () => onChange?.(!value);

  return <RNPSwitch value={value} onValueChange={onValueChange} />;
};

Switch.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.bool,
};
