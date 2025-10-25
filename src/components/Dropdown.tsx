import React, { useCallback, useMemo, useState } from "react";
import { useTheme } from "react-native-paper";
import RNPDropdown from "react-native-paper-dropdown";

import { useTranslation } from "localization";

type DropdownProps = {
  disabled?: boolean;
  itemKeyExtractor?: (item: any) => any;
  itemLabelExtractor?: (item: any) => string;
  label?: string;
  items: any[];
  onChange?: (value: any) => Promise<void>;
  showLabel?: boolean;
  value?: any;
};

export const Dropdown = (props: DropdownProps) => {
  const {
    disabled,
    itemKeyExtractor = (item: any) => item.value,
    itemLabelExtractor = (item: any) => item.label,
    label: labelProp = "common:selectAnItem",
    items,
    onChange,
    showLabel = true,
    value,
  } = props;

  const theme = useTheme();
  const { t } = useTranslation();

  const label = showLabel ? t(labelProp) : "";

  const [open, setOpen] = useState(false);

  const itemToOption = useCallback(
    (item: any) => ({
      value: itemKeyExtractor(item),
      label: t(itemLabelExtractor(item)),
    }),
    [itemKeyExtractor, itemLabelExtractor, t]
  );

  const options = useMemo(() => items.map(itemToOption), [itemToOption, items]);

  const setValue = useCallback(
    async (val: any) => {
      if (disabled) return;
      await onChange?.(val);
    },
    [disabled, onChange]
  );

  const textFont = theme.fonts.labelMedium;
  const textFontSize = textFont.fontSize;

  return (
    <RNPDropdown
      // @ts-ignore
      disabled={disabled}
      dropDownContainerMaxHeight={300}
      dropDownItemStyle={{ backgroundColor: theme.colors.surfaceVariant }}
      dropDownItemTextStyle={{
        color: theme.colors.onSurfaceVariant,
        fontSize: textFontSize,
      }}
      label={label}
      list={options}
      mode="outlined"
      onDismiss={() => setOpen(false)}
      setValue={setValue}
      showDropDown={() => setOpen(true)}
      value={value}
      visible={open}
    />
  );
};
