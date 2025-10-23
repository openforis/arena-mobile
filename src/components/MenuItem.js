import { Menu } from "react-native-paper";
import PropTypes from "prop-types";

import { useIsTextDirectionRtl, useTranslation } from "localization";

const styleRtl = { alignSelf: "flex-end" };
const textStyleRtl = { textAlign: "right", marginRight: 6 };

export const MenuItem = (props) => {
  const { disabled, icon, onPress, title, toggleMenu = undefined } = props;

  const { t } = useTranslation();
  const isRtl = useIsTextDirectionRtl();

  return (
    <Menu.Item
      disabled={disabled}
      leadingIcon={isRtl ? undefined : icon}
      onPress={() => {
        toggleMenu?.();
        onPress();
      }}
      style={isRtl ? styleRtl : undefined}
      titleStyle={isRtl ? textStyleRtl : undefined}
      title={t(title)}
      trailingIcon={isRtl ? icon : undefined}
    />
  );
};

MenuItem.propTypes = {
  disabled: PropTypes.bool,
  icon: PropTypes.string,
  onPress: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  toggleMenu: PropTypes.func,
};
