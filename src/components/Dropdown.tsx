import React, { useCallback, useMemo } from "react";
import { Menu, useTheme } from "react-native-paper";
import {
  Dropdown as RNPDropdown,
  DropdownItemProps,
} from "react-native-paper-dropdown";

import { useTranslation } from "localization";

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

const DropdownItem = (props: DropdownItemProps) => {
  const { onSelect, option, toggleMenu, width } = props;

  const theme = useTheme();

  return (
    <Menu.Item
      contentStyle={{ minWidth: width }}
      onPress={() => {
        onSelect?.(option.value);
        toggleMenu();
      }}
      style={{
        backgroundColor: theme.colors.surfaceVariant,
        minWidth: width,
      }}
      title={option.label}
      titleStyle={{
        color: theme.colors.onSurfaceVariant,
        fontSize: theme.fonts.labelMedium.fontSize,
      }}
    />
  );
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

  const label = showLabel ? t(labelProp) : "";

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

  return (
    <RNPDropdown
      CustomDropdownItem={DropdownItem}
      disabled={disabled}
      hideMenuHeader
      label={label}
      maxMenuHeight={300}
      mode="outlined"
      onSelect={setValue}
      options={options}
      value={value}
    />
  );
};
