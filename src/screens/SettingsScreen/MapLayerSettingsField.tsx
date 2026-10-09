import { useCallback } from "react";

import { RadioButton, RadioButtonGroup } from "components";
import { useTranslation } from "localization";
import { MapLayers, SettingsModel } from "model";
import { SettingsActions, SettingsSelectors, useAppDispatch } from "state";

import { SettingsFormItem } from "./SettingsFormItem";

const settingKey = SettingsModel.SettingKey.mapLayer;

/**
 * Custom (non-generic-schema) settings field for choosing the default map layer.
 * Not driven by SettingsModel.properties because the option list is dynamic
 * (it includes the custom layers defined by the user).
 */
export const MapLayerSettingsField = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  // subscribed to the settings: the layers change when the custom layers change
  const { mapLayer } = SettingsSelectors.useSettings();
  const layers = MapLayers.getLayers();

  const onValueChange = useCallback(
    (value: string) => {
      dispatch(SettingsActions.updateSetting({ key: settingKey, value }));
    },
    [dispatch],
  );

  return (
    <SettingsFormItem
      settingKey={settingKey}
      labelKey="settings:mapLayer.label"
      descriptionKey="settings:mapLayer.description"
    >
      <RadioButtonGroup
        onValueChange={onValueChange}
        value={MapLayers.getLayer(mapLayer).id}
      >
        {layers.map((layer) => (
          <RadioButton
            key={layer.id}
            label={MapLayers.getLayerLabel(layer, t)}
            value={layer.id}
          />
        ))}
      </RadioButtonGroup>
    </SettingsFormItem>
  );
};
