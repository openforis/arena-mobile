import React, { useCallback, useMemo, useState } from "react";
import { useTheme } from "react-native-paper";
import RNPDropdown from "react-native-paper-dropdown";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

// @ts-expect-error TS(2307): Cannot find module 'localization' or its correspon... Remove this comment to see the full error message
import { useTranslation } from "localization";

export const Dropdown = (props: any) => {
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
      label: t(itemLabelExtractor(item))
    }),
    [itemKeyExtractor, itemLabelExtractor, t]
  );

  const options = useMemo(() => items.map(itemToOption), [itemToOption, items]);

  const setValue = useCallback(
    async (val: any) => {
      if (disabled) return;
      await onChange(val);
    },
    [disabled, onChange]
  );

  const textFont = theme.fonts.labelMedium;
  const textFontSize = textFont.fontSize;

  return (
    <RNPDropdown
      // @ts-expect-error TS(2322): Type '{ disabled: any; dropDownContainerMaxHeight:... Remove this comment to see the full error message
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
