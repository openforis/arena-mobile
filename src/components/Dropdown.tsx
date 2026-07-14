import React, { useCallback, useMemo, useState } from "react";
import { useTheme } from "react-native-paper";
import RNPDropdown from "react-native-paper-dropdown";

import { useTranslation } from "localization";

type DropdownProps = {
  disabled?: boolean;
  itemKeyExtractor?: (item: any) => any;
  itemLabelIsI18nKeyExtractor?: (item: any) => boolean;
  itemLabelExtractor?: (item: any) => string;
  label?: string;
  items: any[];
  onChange?: (value: any) => Promise<void>;
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

  const theme = useTheme();
  const { t } = useTranslation();

  const label = showLabel ? t(labelProp) : "";

  const [state, setState] = useState({
    open: false,
    /**
     * workaround: used to force re-render when opening or closing the dropdown;
     * without this, the dropdown remains closed after selecting an already selected item;
     */
    timeOpenSet: Date.now(),
  });

  const { open, timeOpenSet } = state;

  const setOpen = useCallback((val: boolean) => {
    setState({ open: val, timeOpenSet: Date.now() });
  }, []);
  const closeDropDown = useCallback(() => setOpen(false), [setOpen]);
  const openDropDown = useCallback(() => setOpen(true), [setOpen]);

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

  const options = useMemo(() => items.map(itemToOption), [itemToOption, items]);

  const setValue = useCallback(
    async (val: any) => {
      if (disabled) return;
      await onChange?.(val);
    },
    [disabled, onChange],
  );

  const dropDownItemTextStyle = useMemo(() => {
    const textFont = theme.fonts.labelMedium;
    const textFontSize = textFont.fontSize;
    return {
      color: theme.colors.onSurfaceVariant,
      fontSize: textFontSize,
    };
  }, [theme]);

  const dropDownItemStyle = useMemo(
    () => ({ backgroundColor: theme.colors.surfaceVariant }),
    [theme],
  );

  return (
    <RNPDropdown
      // @ts-ignore
      disabled={disabled}
      dropDownContainerMaxHeight={300}
      dropDownItemStyle={dropDownItemStyle}
      dropDownItemTextStyle={dropDownItemTextStyle}
      key={timeOpenSet}
      label={label}
      list={options}
      mode="outlined"
      onDismiss={closeDropDown}
      setValue={setValue}
      showDropDown={openDropDown}
      value={value}
      visible={open}
    />
  );
};
