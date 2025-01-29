import { useCallback, useState } from "react";
import PropTypes from "prop-types";

import { Numbers, Objects } from "@openforis/arena-core";

import {
  Dropdown,
  SegmentedButtons,
  Slider,
  Switch,
  TextInput,
} from "components";

import { SettingsModel } from "model";
import { SettingsFormItem } from "./SettingsFormItem";

const numberToString = (value) => (Objects.isEmpty(value) ? "" : String(value));
const stringToNumber = (value) =>
  Objects.isEmpty(value) ? NaN : Number(value);

export const SettingsItem = (props) => {
  const { settings, settingKey, prop, onPropValueChange } = props;
  const { type, labelKey, descriptionKey, options } = prop;
  const value = settings[settingKey];

  const [error, setError] = useState(false);

  const onValueChange = useCallback(
    (val) => {
      if (val !== value) {
        onPropValueChange({ key: settingKey })(val);
      }
    },
    [onPropValueChange, settingKey, value]
  );

  switch (type) {
    case SettingsModel.propertyType.boolean:
      return (
        <SettingsFormItem
          settingKey={settingKey}
          labelKey={labelKey}
          descriptionKey={descriptionKey}
          direction="horizontal"
        >
          <Switch value={value} onChange={onValueChange} />
        </SettingsFormItem>
      );
    case SettingsModel.propertyType.dropdown:
      return (
        <Dropdown
          items={options}
          itemKeyExtractor={(item) => item.key}
          label={labelKey}
          onChange={onPropValueChange({ key: settingKey })}
          value={value}
        />
      );
    case SettingsModel.propertyType.numeric:
      return (
        <SettingsFormItem
          settingKey={settingKey}
          labelKey={labelKey}
          descriptionKey={descriptionKey}
        >
          <TextInput
            error={error}
            keyboardType="numeric"
            onChange={(val) => {
              const valueNext = stringToNumber(val);
              setError(numberToString(valueNext) !== val);
              onValueChange(valueNext);
            }}
            defaultValue={numberToString(value)}
          />
        </SettingsFormItem>
      );
    case SettingsModel.propertyType.options:
      return (
        <SettingsFormItem settingKey={settingKey} labelKey={labelKey}>
          <SegmentedButtons
            buttons={options}
            onChange={onValueChange}
            value={value}
          />
        </SettingsFormItem>
      );
    case SettingsModel.propertyType.slider: {
      const { minValue, maxValue, step } = prop;
      return (
        <SettingsFormItem
          settingKey={settingKey}
          labelKey={labelKey}
          labelParams={{ value }}
        >
          <Slider
            minValue={minValue}
            maxValue={maxValue}
            step={step}
            value={value}
            onValueChange={(values) =>
              onValueChange(Numbers.roundToPrecision(values[0], 2))
            }
          />
        </SettingsFormItem>
      );
    }
    default:
      return null;
  }
};

SettingsItem.propTypes = {
  settings: PropTypes.object.isRequired,
  settingKey: PropTypes.string.isRequired,
  prop: PropTypes.object.isRequired,
  onPropValueChange: PropTypes.func.isRequired,
};
