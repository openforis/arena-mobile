import * as React from "react";
import { Switch as RNPSwitch } from "react-native-paper";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

export const Switch = (props: any) => {
  const { onChange, value } = props;

  const onValueChange = () => onChange?.(!value);

  return <RNPSwitch value={value} onValueChange={onValueChange} />;
};

Switch.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.bool,
};
