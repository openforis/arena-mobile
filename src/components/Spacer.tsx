import { useMemo } from "react";

import { View } from "./View";

type Props = {
  fullFlex?: boolean;
  fullWidth?: boolean;
  width?: number;
};

export const Spacer = (props: Props) => {
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
