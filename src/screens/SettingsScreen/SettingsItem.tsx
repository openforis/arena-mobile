import { useCallback, useState } from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { Numbers, Objects } from "@openforis/arena-core";

import {
  Dropdown,
  SegmentedButtons,
  Slider,
  Switch,
  TextInput,
// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
} from "components";
// @ts-expect-error TS(2307): Cannot find module 'localization' or its correspon... Remove this comment to see the full error message
import { i18n } from "localization";
// @ts-expect-error TS(2307): Cannot find module 'model' or its corresponding ty... Remove this comment to see the full error message
import { SettingsModel } from "model";
import { SettingsFormItem } from "./SettingsFormItem";

const numberToString = (value: any) => Objects.isEmpty(value) ? "" : String(value);
const stringToNumber = (value: any) => Objects.isEmpty(value) ? NaN : Number(value);

const determineTextKey = (...possibleKeys: any[]) =>
  possibleKeys.find((possibleKey) => possibleKey && i18n.exists(possibleKey));

export const SettingsItem = (props: any) => {
  const { settings, settingKey, prop, onPropValueChange } = props;
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
          itemKeyExtractor={(item: any) => item.key}
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
            onChange={(val: any) => {
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
            onValueChange={(value: any) => onValueChange(Numbers.roundToPrecision(value, 2))
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
