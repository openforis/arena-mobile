import { useCallback, useMemo, useState } from "react";
import { Menu } from "react-native-paper";
import { StyleProp, ViewStyle } from "react-native";

import { Button, ButtonMode } from "./Button";
import { IconButton } from "./IconButton";
import { MenuItem } from "./MenuItem";

type Props = {
  anchorPosition?: "top" | "bottom";
  icon?: string;
  items: any[];
  label?: string;
  menuStyle?: StyleProp<ViewStyle>;
  mode?: ButtonMode;
};

export const MenuButton = (props: Props) => {
  const { anchorPosition = "bottom", icon, items, label, menuStyle, mode } =
    props;

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
    [icon, label, mode, openMenu],
  );

  if (!menuVisible) {
    return anchor;
  }

  return (
    <Menu
      anchor={anchor}
      anchorPosition={anchorPosition}
      onDismiss={closeMenu}
      style={menuStyle}
      visible
    >
      {items.map(
        ({
          key,
          disabled,
          icon,
          label,
          labelIsI18nKey,
          onPress,
          keepMenuOpenOnPress = false,
        }: any) => (
          <MenuItem
            key={key}
            disabled={disabled}
            icon={icon}
            titleIsI18nKey={labelIsI18nKey}
            onPress={() => {
              if (!keepMenuOpenOnPress) {
                closeMenu();
              }
              onPress();
            }}
            title={label}
          />
        ),
      )}
    </Menu>
  );
};
