import { useMemo } from "react";
import PropTypes from "prop-types";

import { Icon } from "./Icon";

export const AlertIcon = (props) => {
  const { hasErrors, hasWarnings } = props;

  const iconColor = useMemo(() => {
    if (hasErrors) return "red";
    if (hasWarnings) return "orange";
    return undefined;
  }, [hasErrors, hasWarnings]);

  return iconColor ? <Icon color={iconColor} source="alert" /> : null;
};

AlertIcon.propTypes = {
  hasErrors: PropTypes.bool,
  hasWarnings: PropTypes.bool,
};
