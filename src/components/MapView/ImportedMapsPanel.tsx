import { useCallback } from "react";
import { useTheme } from "react-native-paper";

import { ImportedMap } from "model/ImportedMap";
import { SettingsActions } from "state/settings/actions";
import { SettingsSelectors } from "state/settings/selectors";
import { useAppDispatch } from "state/storeHooks";

import { Checkbox } from "../Checkbox";
import { HView } from "../HView";
import { IconButton } from "../IconButton";
import { Modal } from "../Modal";
import { ScrollView } from "../ScrollView";
import { Slider } from "../Slider";
import { Text } from "../Text";
import { VView } from "../VView";
import styles from "./styles";

const OPACITY_STEP = 0.1;

type ItemProps = {
  importedMap: ImportedMap;
  onToggle: (importedMap: ImportedMap) => void;
  onOpacityChange: (importedMap: ImportedMap, opacity: number) => void;
  onZoomToMap: (importedMap: ImportedMap) => void;
};

const ImportedMapItem = ({
  importedMap,
  onToggle,
  onOpacityChange,
  onZoomToMap,
}: ItemProps) => {
  const theme = useTheme();
  return (
    <VView
      style={[
        styles.importedMapItem,
        { borderColor: theme.colors.outlineVariant },
      ]}
    >
      <HView style={styles.importedMapItemHeader}>
        <VView style={styles.importedMapItemCheckbox}>
          <Checkbox
            checked={importedMap.visible}
            label={importedMap.name}
            labelIsI18nKey={false}
            onPress={() => onToggle(importedMap)}
          />
        </VView>
        <IconButton
          icon="fit-to-screen-outline"
          onPress={() => onZoomToMap(importedMap)}
        />
      </HView>
      {importedMap.visible && (
        <HView style={styles.importedMapOpacityRow}>
          <Text
            textKey="importedMaps:opacity"
            textParams={{ value: Math.round(importedMap.opacity * 100) }}
          />
          <VView style={styles.importedMapOpacitySlider}>
            <Slider
              minValue={OPACITY_STEP}
              maxValue={1}
              step={OPACITY_STEP}
              value={importedMap.opacity}
              onValueChange={(value) => onOpacityChange(importedMap, value)}
            />
          </VView>
        </HView>
      )}
    </VView>
  );
};

type Props = {
  onDismiss: () => void;
  onZoomToMap: (importedMap: ImportedMap) => void;
};

// lets the user choose the imported maps (PDF, GeoTIFF) shown on the maps and their opacity
export const ImportedMapsPanel = ({ onDismiss, onZoomToMap }: Props) => {
  const dispatch = useAppDispatch();
  const settings = SettingsSelectors.useSettings();
  const importedMaps = settings.importedMaps ?? [];

  const onToggle = useCallback(
    (importedMap: ImportedMap) => {
      void dispatch(
        SettingsActions.updateImportedMap({
          mapId: importedMap.id,
          changes: { visible: !importedMap.visible },
        }),
      );
    },
    [dispatch],
  );

  const onOpacityChange = useCallback(
    (importedMap: ImportedMap, value: number) => {
      // slider values can have rounding errors
      const opacity = Math.round(value * 10) / 10;
      void dispatch(
        SettingsActions.updateImportedMap({
          mapId: importedMap.id,
          changes: { opacity },
        }),
      );
    },
    [dispatch],
  );

  const onZoomToMapPress = useCallback(
    (importedMap: ImportedMap) => {
      onZoomToMap(importedMap);
      onDismiss();
    },
    [onDismiss, onZoomToMap],
  );

  return (
    <Modal onDismiss={onDismiss} titleKey="importedMaps:title">
      <ScrollView>
        <VView style={styles.importedMapItems}>
          {importedMaps.map((importedMap) => (
            <ImportedMapItem
              key={importedMap.id}
              importedMap={importedMap}
              onToggle={onToggle}
              onOpacityChange={onOpacityChange}
              onZoomToMap={onZoomToMapPress}
            />
          ))}
        </VView>
      </ScrollView>
    </Modal>
  );
};
