import { useCallback, useState } from "react";

import { Numbers, Objects } from "@openforis/arena-core";

import {
  Dropdown,
  SegmentedButtons,
  Slider,
  Switch,
  TextInput,
} from "components";
import { i18n } from "localization";
import { SettingsModel, SettingsObject } from "model";
import { SettingsFormItem } from "./SettingsFormItem";

const numberToString = (value: any) =>
  Objects.isEmpty(value) ? "" : String(value);
const stringToNumber = (value: any) =>
  Objects.isEmpty(value) ? Number.NaN : Number(value);

const determineTextKey = (...possibleKeys: any[]) =>
  possibleKeys.find((possibleKey) => possibleKey && i18n.exists(possibleKey));

type SettingsItemProps = {
  settings: any;
  settingKey: keyof SettingsObject;
  prop: any;
  onPropValueChange: (params: {
    key: keyof SettingsObject;
  }) => (value: any) => Promise<void>;
};

export const SettingsItem = (props: SettingsItemProps) => {
  const { settings, settingKey, prop, onPropValueChange } = props;
  if (__DEV__) {
    console.log("rendering SettingsItem " + settingKey);
  }
  const {
    type,
    labelKey: labelKeyProp,
    descriptionKey: descriptionKeyProp,
    options,
  } = prop;

  const value = settings[settingKey];

  const [error, setError] = useState(false);

  const onValueChange = useCallback(
    (val: any) => {
      onPropValueChange({ key: settingKey })(val);
    },
    [onPropValueChange, settingKey]
  );

  const labelKey = determineTextKey(
    labelKeyProp,
    `settings:${settingKey}.label`,
    `settings:${settingKey}`
  );

  const descriptionKey = determineTextKey(
    descriptionKeyProp,
    `settings:${settingKey}.description`
  );

  switch (type) {
    case SettingsModel.PropertyType.boolean:
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
    case SettingsModel.PropertyType.dropdown:
      return (
        <Dropdown
          items={options}
          itemKeyExtractor={(item: any) => item.key}
          label={labelKey}
          onChange={onPropValueChange({ key: settingKey })}
          value={value}
        />
      );
    case SettingsModel.PropertyType.numeric:
      return (
        <SettingsFormItem
          settingKey={settingKey}
          labelKey={labelKey}
          descriptionKey={descriptionKey}
        >
          <TextInput
            error={error}
            keyboardType="numeric"
            onChange={(val: any) => {
              const valueNext = stringToNumber(val);
              setError(numberToString(valueNext) !== val);
              onValueChange(valueNext);
            }}
            defaultValue={numberToString(value)}
          />
        </SettingsFormItem>
      );
    case SettingsModel.PropertyType.options:
      return (
        <SettingsFormItem settingKey={settingKey} labelKey={labelKey}>
          <SegmentedButtons
            buttons={options}
            onChange={onValueChange}
            value={value}
          />
        </SettingsFormItem>
      );
    case SettingsModel.PropertyType.slider: {
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
            onValueChange={(value: any) =>
              onValueChange(Numbers.roundToPrecision(value, 2))
            }
          />
        </SettingsFormItem>
      );
    }
    default:
      return null;
  }
};
