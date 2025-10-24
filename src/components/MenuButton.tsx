import { useCallback, useMemo, useState } from "react";
import { Menu } from "react-native-paper";
import PropTypes from "prop-types";

import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { MenuItem } from "./MenuItem";

export const MenuButton = (props: any) => {
  const { icon, items, label, style } = props;

  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = useCallback(() => {
    setMenuVisible(true);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuVisible(false);
  }, []);

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

  if (!menuVisible) {
    return anchor;
  }

  return (
    <Menu style={style} visible onDismiss={closeMenu} anchor={anchor}>
      {items.map(
        ({
          key,
          disabled,
          icon,
          label,
          onPress,
          keepMenuOpenOnPress = false
        }: any) => (
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
