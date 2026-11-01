import React, { useCallback, useMemo, useState } from "react";
import {
  Keyboard,
  LayoutChangeEvent,
  ScrollView,
  StatusBar,
  View,
} from "react-native";
import { Menu, TextInput, TouchableRipple, useTheme } from "react-native-paper";

import { useTranslation } from "localization";

const MAX_MENU_HEIGHT = 300;

type DropdownProps = {
  disabled?: boolean;
  itemKeyExtractor?: (item: any) => any;
  itemLabelIsI18nKeyExtractor?: (item: any) => boolean;
  itemLabelExtractor?: (item: any) => string;
  label?: string;
  items: any[];
  onChange?: (value: any) => Promise<void> | void;
  translateItemLabels?: boolean;
  showLabel?: boolean;
  value?: any;
};

export const Dropdown = (props: DropdownProps) => {
  const {
    disabled,
    itemKeyExtractor = (item: any) => item.value,
    itemLabelIsI18nKeyExtractor = (item: any) => item.labelIsI18nKey ?? true,
    itemLabelExtractor = (item: any) => item.label,
    label: labelProp = "common:selectAnItem",
    items,
    onChange,
    translateItemLabels = true,
    showLabel = true,
    value,
  } = props;

  const { t } = useTranslation();
  const theme = useTheme();

  const [menuVisible, setMenuVisible] = useState(false);
  const [width, setWidth] = useState(0);

  const labelText = t(labelProp);

  const itemToOption = useCallback(
    (item: any) => ({
      value: itemKeyExtractor(item),
      label:
        translateItemLabels && itemLabelIsI18nKeyExtractor(item)
          ? t(itemLabelExtractor(item))
          : itemLabelExtractor(item),
    }),
    [
      itemKeyExtractor,
      itemLabelExtractor,
      itemLabelIsI18nKeyExtractor,
      t,
      translateItemLabels,
    ],
  );

  const options = useMemo(
    () => items.map((item) => itemToOption(item)),
    [itemToOption, items],
  );

  const setValue = useCallback(
    async (val: any) => {
      if (disabled) return;
      await onChange?.(val);
    },
    [disabled, onChange],
  );

  const openMenu = useCallback(() => {
    Keyboard.dismiss();
    setMenuVisible(true);
  }, []);

  const closeMenu = useCallback(() => setMenuVisible(false), []);

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width),
    [],
  );

  const selectedLabel = options.find((option) => option.value === value)?.label;

  return (
    <Menu
      anchor={
        <TouchableRipple
          aria-disabled={!!disabled}
          aria-expanded={menuVisible}
          aria-label={
            selectedLabel ? `${labelText}: ${selectedLabel}` : labelText
          }
          role="combobox"
          disabled={disabled}
          onLayout={onLayout}
          onPress={openMenu}
        >
          <View pointerEvents="none">
            <TextInput
              disabled={disabled}
              editable={false}
              label={showLabel ? labelText : ""}
              mode="outlined"
              right={
                <TextInput.Icon
                  icon={menuVisible ? "menu-up" : "menu-down"}
                  pointerEvents="none"
                />
              }
              value={selectedLabel}
            />
          </View>
        </TouchableRipple>
      }
      contentStyle={{ paddingVertical: 0 }}
      elevation={5}
      keyboardShouldPersistTaps="handled"
      onDismiss={closeMenu}
      statusBarHeight={StatusBar.currentHeight ?? undefined}
      style={{ width }}
      visible={menuVisible}
    >
      <ScrollView bounces={false} style={{ maxHeight: MAX_MENU_HEIGHT }}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Menu.Item
              accessibilityState={{ selected }}
              contentStyle={{ minWidth: width }}
              key={option.value}
              onPress={() => {
                setValue(option.value);
                closeMenu();
              }}
              style={{
                backgroundColor: selected
                  ? theme.colors.primaryContainer
                  : theme.colors.elevation.level1,
                minWidth: width,
              }}
              title={option.label}
              titleStyle={{
                color: selected
                  ? theme.colors.onPrimaryContainer
                  : theme.colors.onSurfaceVariant,
                fontSize: theme.fonts.labelMedium.fontSize,
                fontWeight: selected ? "bold" : undefined,
              }}
            />
          );
        })}
      </ScrollView>
    </Menu>
  );
};
