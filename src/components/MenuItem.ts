import { Menu } from "react-native-paper";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

// @ts-expect-error TS(2307): Cannot find module 'localization' or its correspon... Remove this comment to see the full error message
import { useIsTextDirectionRtl, useTranslation } from "localization";

const styleRtl = { alignSelf: "flex-end" };
const textStyleRtl = { textAlign: "right", marginRight: 6 };

export const MenuItem = (props: any) => {
  const { disabled, icon, onPress, title, toggleMenu = undefined } = props;

  const { t } = useTranslation();
  const isRtl = useIsTextDirectionRtl();

  return (
    // @ts-expect-error TS(2503): Cannot find namespace 'Menu'.
    <Menu.Item
      disabled={disabled}
      // @ts-expect-error TS(7027): Unreachable code detected.
      leadingIcon={isRtl ? undefined : icon}
      // @ts-expect-error TS(2588): Cannot assign to 'onPress' because it is a constan... Remove this comment to see the full error message
      onPress={() => {
        // @ts-expect-error TS(2304): Cannot find name 'toggleMenu'.
        toggleMenu?.();
        // @ts-expect-error TS(2304): Cannot find name 'onPress'.
        onPress();
      }}
      // @ts-expect-error TS(2304): Cannot find name 'style'.
      style={isRtl ? styleRtl : undefined}
      // @ts-expect-error TS(2304): Cannot find name 'titleStyle'.
      titleStyle={isRtl ? textStyleRtl : undefined}
      // @ts-expect-error TS(2304): Cannot find name 'title'.
      title={t(title: any)}
      // @ts-expect-error TS(2304): Cannot find name 'trailingIcon'.
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
