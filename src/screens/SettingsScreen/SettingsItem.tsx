import { useCallback, useState } from "react";

import { Numbers, Objects } from "@openforis/arena-core";

import {
  Dropdown,
  RadioButton,
  RadioButtonGroup,
  SegmentedButtons,
  Slider,
  Switch,
  Text,
  TextInput,
  VView,
} from "components";
import { i18n, useTranslation } from "localization";
import { SettingsModel, SettingsObject } from "model";
import { SettingsFormItem } from "./SettingsFormItem";
import styles from "./styles";

const numberToString = (value: unknown) =>
  Objects.isEmpty(value) ? "" : String(value);
const stringToNumber = (value: string) =>
  Objects.isEmpty(value) ? Number.NaN : Number(value);

const determineTextKey = (...possibleKeys: (string | undefined)[]) =>
  possibleKeys.find((possibleKey) => possibleKey && i18n.exists(possibleKey));

type SettingsDropdownOption = {
  key: string | number;
  label: string;
  labelIsI18nKey?: boolean;
};

type SettingsItemProperty = NonNullable<
  (typeof SettingsModel.properties)[keyof typeof SettingsModel.properties]
> & {
  labelKey?: string;
  descriptionKey?: string;
};

type SettingsItemProps = {
  settings: SettingsObject;
  settingKey: keyof SettingsObject;
  prop: SettingsItemProperty;
  onPropValueChange: (params: {
    key: keyof SettingsObject;
  }) => (value: unknown) => Promise<void> | void;
  translateItemLabels?: boolean;
};

export const SettingsItem = (props: SettingsItemProps) => {
  const {
    settings,
    settingKey,
    prop,
    onPropValueChange,
    translateItemLabels = true,
  } = props;

  const {
    type,
    labelKey: labelKeyProp,
    descriptionKey: descriptionKeyProp,
    options,
  } = prop;

  const value = settings[settingKey];

  const { t } = useTranslation();

  const [error, setError] = useState(false);

  const onValueChange = useCallback(
    (val: unknown) => {
      void onPropValueChange({ key: settingKey })(val);
    },
    [onPropValueChange, settingKey],
  );

  const labelKey = determineTextKey(
    labelKeyProp,
    `settings:${settingKey}.label`,
    `settings:${settingKey}`,
  );

  const descriptionKey = determineTextKey(
    descriptionKeyProp,
    `settings:${settingKey}.description`,
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
          <Switch value={value as boolean} onChange={onValueChange} />
        </SettingsFormItem>
      );
    case SettingsModel.PropertyType.dropdown:
      return (
        <VView>
          <Dropdown
            items={options!}
            itemKeyExtractor={(item: SettingsDropdownOption) => item.key}
            label={labelKey}
            onChange={onPropValueChange({ key: settingKey })}
            translateItemLabels={translateItemLabels}
            value={value as string | number}
          />
          {descriptionKey && (
            <Text
              style={styles.settingsItemDescription}
              textKey={descriptionKey}
              variant="bodySmall"
            />
          )}
        </VView>
      );
    case SettingsModel.PropertyType.radio:
      return (
        <SettingsFormItem
          settingKey={settingKey}
          labelKey={labelKey}
          descriptionKey={descriptionKey}
        >
          <RadioButtonGroup
            onValueChange={onValueChange}
            value={value as string}
          >
            {options!.map((option: SettingsDropdownOption) => (
              <RadioButton
                key={option.key}
                label={translateItemLabels ? t(option.label) : option.label}
                value={option.key as string}
              />
            ))}
          </RadioButtonGroup>
        </SettingsFormItem>
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
            onChange={(val: string) => {
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
        <SettingsFormItem
          settingKey={settingKey}
          labelKey={labelKey}
          descriptionKey={descriptionKey}
        >
          <SegmentedButtons
            buttons={options!.map(({ key, label }) => ({
              value: String(key),
              label,
            }))}
            onChange={onValueChange}
            value={value as string}
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
          descriptionKey={descriptionKey}
        >
          <Slider
            minValue={minValue}
            maxValue={maxValue}
            step={step}
            value={value as number}
            onValueChange={(value: number) =>
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
