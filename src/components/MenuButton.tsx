import { useCallback, useMemo, useState } from "react";
import { Menu } from "react-native-paper";
import { StyleProp, ViewStyle } from "react-native";

import { Button, ButtonMode } from "./Button";
import { IconButton } from "./IconButton";
import { MenuItem } from "./MenuItem";

type Props = {
  icon?: string;
  items: any[];
  label?: string;
  mode?: ButtonMode;
  style?: StyleProp<ViewStyle>;
};

export const MenuButton = (props: Props) => {
  const { icon, items, label, mode, style } = props;

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
          mode={mode}
          onPress={openMenu}
          textKey={label}
        />
      ) : (
        <IconButton avoidMultiplePress={false} icon={icon} onPress={openMenu} />
      ),
    [icon, label, mode, openMenu]
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
