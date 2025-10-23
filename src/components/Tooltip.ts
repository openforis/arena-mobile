import { Tooltip as RNPTooltip } from "react-native-paper";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

// @ts-expect-error TS(2307): Cannot find module 'localization' or its correspon... Remove this comment to see the full error message
import { useTranslation } from "localization";

export const Tooltip = (props: any) => {
  const { backgroundColor, children, textColor, titleKey, titleParams } = props;

  const { t } = useTranslation();

  const theme =
    backgroundColor || textColor
      ? {
          isV3: true,
          colors: {
            onSurface: backgroundColor,
            surface: textColor,
          },
        }
      : undefined;

  return (
    // @ts-expect-error TS(2749): 'RNPTooltip' refers to a value, but is being used ... Remove this comment to see the full error message
    <RNPTooltip
      // @ts-expect-error TS(2304): Cannot find name 'enterTouchDelay'.
      enterTouchDelay={50}
      // @ts-expect-error TS(7027): Unreachable code detected.
      theme={theme}
      // @ts-expect-error TS(2304): Cannot find name 'title'.
      title={t(titleKey: any, titleParams: any)}
    >
      {children}
    </RNPTooltip>
  );
};

Tooltip.propTypes = {
  backgroundColor: PropTypes.string,
  children: PropTypes.node,
  textColor: PropTypes.string,
  titleKey: PropTypes.string.isRequired,
  titleParams: PropTypes.object,
};
