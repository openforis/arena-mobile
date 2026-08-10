import { useMemo } from "react";

import { Icon } from "./Icon";

type Props = {
  hasErrors?: boolean;
  hasWarnings?: boolean;
  size?: number;
};

export const AlertIcon = (props: Props) => {
  const { hasErrors, hasWarnings, size } = props;

  const iconColor = useMemo(() => {
    if (hasErrors) return "red";
    if (hasWarnings) return "orange";
    return undefined;
  }, [hasErrors, hasWarnings]);

  return iconColor ? (
    <Icon color={iconColor} size={size} source="alert" />
  ) : null;
};
