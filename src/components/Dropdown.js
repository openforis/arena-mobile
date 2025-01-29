import React, { useCallback, useMemo, useState } from "react";
import { useTheme } from "react-native-paper";
import RNPDropdown from "react-native-paper-dropdown";
import PropTypes from "prop-types";

import { useTranslation } from "localization";

export const Dropdown = (props) => {
  const {
    disabled,
    itemKeyExtractor = (item) => item.value,
    itemLabelExtractor = (item) => item.label,
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
    (item) => ({
      value: itemKeyExtractor(item),
      label: t(itemLabelExtractor(item)),
    }),
    [itemKeyExtractor, itemLabelExtractor, t]
  );

  const options = useMemo(() => items.map(itemToOption), [itemToOption, items]);

  const setValue = useCallback(
    async (val) => {
      if (disabled) return;
      await onChange(val);
    },
    [disabled, onChange]
  );

  return (
    <RNPDropdown
      disabled={disabled}
      dropDownContainerMaxHeight={300}
      dropDownItemStyle={{ backgroundColor: theme.colors.surfaceVariant }}
      dropDownItemTextStyle={{ color: theme.colors.onSurfaceVariant }}
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

Dropdown.propTypes = {
  disabled: PropTypes.bool,
  itemKeyExtractor: PropTypes.func,
  itemLabelExtractor: PropTypes.func,
  label: PropTypes.string,
  items: PropTypes.array,
  onChange: PropTypes.func,
  showLabel: PropTypes.bool,
  value: PropTypes.any,
};
