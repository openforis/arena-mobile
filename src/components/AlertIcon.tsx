import { useMemo } from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { Icon } from "./Icon";

export const AlertIcon = (props: any) => {
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
