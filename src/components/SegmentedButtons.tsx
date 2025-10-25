import { useMemo } from "react";
import {
  SegmentedButtons as RNPSegmentedButtons,
  useTheme,
} from "react-native-paper";
import PropTypes from "prop-types";

import { useTranslation } from "localization";

export const SegmentedButtons = (props: any) => {
  const { buttons, onChange, style, value } = props;

  const { t } = useTranslation();
  const theme = useTheme();

  const buttonsTheme = useMemo(
    () => ({
      colors: {
        secondaryContainer: theme.colors.primary,
        onSecondaryContainer: theme.colors.onPrimary,
      },
    }),
    [theme]
  );

  return (
    <RNPSegmentedButtons
      buttons={buttons.map(({
        icon,
        label,
        value
      }: any) => ({
        icon,
        label: t(label),
        value,
      }))}
      onValueChange={onChange}
      style={style}
      theme={buttonsTheme}
      value={value}
    />
  );
};

SegmentedButtons.propTypes = {
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string,
      label: PropTypes.string,
      value: PropTypes.string.isRequired,
    })
  ),
  onChange: PropTypes.func.isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  value: PropTypes.any,
};
