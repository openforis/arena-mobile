import { useCallback, useMemo, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";

import {
  Button,
  HView,
  ScreenView,
  Slider,
  Text,
  TextInput,
  VView,
} from "components";
import { CustomMapLayer } from "model";
import {
  CustomMapLayersService,
  CustomMapLayerTestResult,
  CustomMapLayerValidation,
} from "service";
import { SettingsActions, SettingsSelectors, useAppDispatch } from "state";
import { log } from "utils";

import styles from "./styles";

export type CustomMapLayerEditorParams = { layerId?: string };

const MIN_SELECTABLE_MAX_ZOOM = 10;
const MAX_SELECTABLE_MAX_ZOOM = 22;

type TestState = {
  testing: boolean;
  result: CustomMapLayerTestResult | null;
};

const determineTestResultTextKey = ({
  success,
  status,
}: CustomMapLayerTestResult) => {
  if (success) return "offlineMaps:customLayers.editor.test.success";
  return status
    ? "offlineMaps:customLayers.editor.test.errorStatus"
    : "offlineMaps:customLayers.editor.test.errorNotReachable";
};

export const CustomMapLayerEditorScreen = () => {
  log.debug("rendering CustomMapLayerEditorScreen");

  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const { layerId } = (route.params ??
    {}) as Partial<CustomMapLayerEditorParams>;

  const settings = SettingsSelectors.useSettings();
  const layers = useMemo(
    () => settings.customMapLayers ?? [],
    [settings.customMapLayers],
  );

  const [layer, setLayer] = useState<CustomMapLayer>(
    () =>
      layers.find((item) => item.id === layerId) ??
      CustomMapLayersService.newLayer(),
  );
  const [apiKey, setApiKey] = useState(() =>
    CustomMapLayersService.getApiKey(layer.id),
  );
  // errors are shown only after the first attempt to save or test the layer
  const [validationVisible, setValidationVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testState, setTestState] = useState<TestState>({
    testing: false,
    result: null,
  });

  const validation: CustomMapLayerValidation = useMemo(
    () => CustomMapLayersService.validateLayer({ layer, apiKey, layers }),
    [apiKey, layer, layers],
  );
  const valid = CustomMapLayersService.isValid(validation);
  const errors: CustomMapLayerValidation = validationVisible ? validation : {};

  const updateLayer = useCallback((layerPartial: Partial<CustomMapLayer>) => {
    setLayer((layerPrev) => ({ ...layerPrev, ...layerPartial }));
    setTestState({ testing: false, result: null });
  }, []);

  const onNameChange = useCallback(
    (name: string) => updateLayer({ name }),
    [updateLayer],
  );
  const onUrlTemplateChange = useCallback(
    (urlTemplate: string) => updateLayer({ urlTemplate }),
    [updateLayer],
  );
  const onAttributionChange = useCallback(
    (attribution: string) => updateLayer({ attribution }),
    [updateLayer],
  );
  const onMaxZoomChange = useCallback(
    (maxZoom: number) => updateLayer({ maxZoom: Math.round(maxZoom) }),
    [updateLayer],
  );
  const onApiKeyChange = useCallback((value: string) => {
    setApiKey(value);
    setTestState({ testing: false, result: null });
  }, []);

  const onTestPress = useCallback(async () => {
    setValidationVisible(true);
    if (validation.urlTemplate || validation.apiKey) return;
    setTestState({ testing: true, result: null });
    const result = await CustomMapLayersService.testLayer({
      urlTemplate: layer.urlTemplate,
      apiKey,
    });
    setTestState({ testing: false, result });
  }, [apiKey, layer.urlTemplate, validation.apiKey, validation.urlTemplate]);

  const onSavePress = useCallback(async () => {
    setValidationVisible(true);
    if (!valid) return;
    setSaving(true);
    try {
      await dispatch(SettingsActions.saveCustomMapLayer({ layer, apiKey }));
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  }, [apiKey, dispatch, layer, navigation, valid]);

  const { testing, result: testResult } = testState;

  return (
    <ScreenView>
      <VView style={styles.container}>
        <TextInput
          autoCapitalize="sentences"
          error={!!errors.name}
          label="offlineMaps:customLayers.editor.name"
          onChange={onNameChange}
          value={layer.name}
        />
        {errors.name && <Text style={styles.errorText} textKey={errors.name} />}
        <TextInput
          error={!!errors.urlTemplate}
          keyboardType="url"
          label="offlineMaps:customLayers.editor.url"
          multiline
          onChange={onUrlTemplateChange}
          value={layer.urlTemplate}
        />
        {errors.urlTemplate && (
          <Text style={styles.errorText} textKey={errors.urlTemplate} />
        )}
        <Text
          style={styles.hint}
          textKey="offlineMaps:customLayers.editor.urlHint"
          variant="bodySmall"
        />
        <TextInput
          error={!!errors.apiKey}
          label="offlineMaps:customLayers.editor.apiKey"
          onChange={onApiKeyChange}
          secureTextEntry
          value={apiKey}
        />
        {errors.apiKey && (
          <Text style={styles.errorText} textKey={errors.apiKey} />
        )}
        <Text
          style={styles.hint}
          textKey="offlineMaps:customLayers.editor.apiKeyHint"
          variant="bodySmall"
        />
        <Text
          textKey="offlineMaps:customLayers.maxZoom"
          textParams={{ value: layer.maxZoom }}
        />
        <Slider
          minValue={MIN_SELECTABLE_MAX_ZOOM}
          maxValue={MAX_SELECTABLE_MAX_ZOOM}
          step={1}
          value={layer.maxZoom}
          onValueChange={onMaxZoomChange}
        />
        <TextInput
          label="offlineMaps:customLayers.editor.attribution"
          onChange={onAttributionChange}
          value={layer.attribution ?? ""}
        />
        <Text
          style={styles.hint}
          textKey="offlineMaps:customLayers.editor.attributionHint"
          variant="bodySmall"
        />
        {testResult && (
          <Text
            style={testResult.success ? styles.successText : styles.errorText}
            textKey={determineTestResultTextKey(testResult)}
            textParams={{ status: testResult.status }}
          />
        )}
        <HView style={styles.buttonsRow}>
          <Button
            color="secondary"
            disabled={testing || saving}
            icon="connection"
            loading={testing}
            onPress={onTestPress}
            textKey="offlineMaps:customLayers.editor.test.label"
          />
          <Button
            disabled={testing || saving}
            icon="content-save"
            loading={saving}
            onPress={onSavePress}
            textKey="common:save"
          />
        </HView>
      </VView>
    </ScreenView>
  );
};
