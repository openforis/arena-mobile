import { useCallback, useMemo, useState } from "react";
import { Menu } from "react-native-paper";
import PropTypes from "prop-types";

import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { MenuItem } from "./MenuItem";

export const MenuButton = (props) => {
  const { icon, items, label, style } = props;

  const [state, setState] = useState({ visible: false });
  const { visible } = state;

  const openMenu = useCallback(() => setState({ visible: true }), []);
  const closeMenu = useCallback(() => setState({ visible: false }), []);

  const anchor = useMemo(
    () =>
      label ? (
        <Button
          avoidMultiplePress={false}
          icon={icon}
          onPress={openMenu}
          textKey={label}
        />
      ) : (
        <IconButton avoidMultiplePress={false} icon={icon} onPress={openMenu} />
      ),
    [icon, label, openMenu]
  );

  return (
    <Menu style={style} visible={visible} onDismiss={closeMenu} anchor={anchor}>
      {items.map(
        ({
          key,
          disabled,
          icon,
          label,
          onPress,
          keepMenuOpenOnPress = false,
        }) => (
          <MenuItem
            key={key}
            disabled={disabled}
            icon={icon}
            onPress={() => {
              if (!keepMenuOpenOnPress) {
                closeMenu();
              }
              onPress();
            }}
            title={label}
          />
        )
      )}
    </Menu>
  );
};

MenuButton.propTypes = {
  icon: PropTypes.string,
  items: PropTypes.array.isRequired,
  label: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
