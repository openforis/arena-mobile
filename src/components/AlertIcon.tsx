import { useMemo } from "react";

import { Icon } from "./Icon";

type Props = {
  hasErrors?: boolean;
  hasWarnings?: boolean;
};

export const AlertIcon = (props: Props) => {
  const { hasErrors, hasWarnings } = props;

  const iconColor = useMemo(() => {
    if (hasErrors) return "red";
    if (hasWarnings) return "orange";
    return undefined;
  }, [hasErrors, hasWarnings]);

  return iconColor ? <Icon color={iconColor} source="alert" /> : null;
};
