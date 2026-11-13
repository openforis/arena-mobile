import { useMemo } from "react";
import { Tooltip as RNPTooltip } from "react-native-paper";

import { useTranslation } from "localization";

type Props = {
  backgroundColor?: string;
  children: React.ReactElement;
  textColor?: string;
  titleKey: string;
  titleParams?: any;
};

export const Tooltip = (props: Props) => {
  const { backgroundColor, children, textColor, titleKey, titleParams } = props;

  const { t } = useTranslation();

  const theme = useMemo(
    () =>
      backgroundColor || textColor
        ? {
            isV3: true,
            colors: {
              onSurface: backgroundColor,
              surface: textColor,
            },
          }
        : undefined,
    [backgroundColor, textColor],
  );

  return (
    <RNPTooltip
      enterTouchDelay={50}
      theme={theme}
      title={t(titleKey, titleParams)}
    >
      {children}
    </RNPTooltip>
  );
};
