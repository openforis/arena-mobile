import { SegmentedButtons as RNPSegmentedButtons } from "react-native-paper";
import PropTypes from "prop-types";

import { useTranslation } from "localization";

export const SegmentedButtons = (props) => {
  const { buttons, onChange, style, value } = props;

  const { t } = useTranslation();

  return (
    <RNPSegmentedButtons
      buttons={buttons.map(({ icon, label, value }) => ({
        icon,
        label: t(label),
        value,
      }))}
      onValueChange={onChange}
      style={style}
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
