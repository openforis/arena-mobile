import { useCallback } from "react";
import { useTheme } from "react-native-paper";

import { PdfMap } from "model/PdfMap";
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
  pdfMap: PdfMap;
  onToggle: (pdfMap: PdfMap) => void;
  onOpacityChange: (pdfMap: PdfMap, opacity: number) => void;
  onZoomToMap: (pdfMap: PdfMap) => void;
};

const PdfMapItem = ({
  pdfMap,
  onToggle,
  onOpacityChange,
  onZoomToMap,
}: ItemProps) => {
  const theme = useTheme();
  return (
    <VView
      style={[styles.pdfMapItem, { borderColor: theme.colors.outlineVariant }]}
    >
      <HView style={styles.pdfMapItemHeader}>
        <VView style={styles.pdfMapItemCheckbox}>
          <Checkbox
            checked={pdfMap.visible}
            label={pdfMap.name}
            labelIsI18nKey={false}
            onPress={() => onToggle(pdfMap)}
          />
        </VView>
        <IconButton
          icon="fit-to-screen-outline"
          onPress={() => onZoomToMap(pdfMap)}
        />
      </HView>
      {pdfMap.visible && (
        <HView style={styles.pdfMapOpacityRow}>
          <Text
            textKey="pdfMaps:opacity"
            textParams={{ value: Math.round(pdfMap.opacity * 100) }}
          />
          <VView style={styles.pdfMapOpacitySlider}>
            <Slider
              minValue={OPACITY_STEP}
              maxValue={1}
              step={OPACITY_STEP}
              value={pdfMap.opacity}
              onValueChange={(value) => onOpacityChange(pdfMap, value)}
            />
          </VView>
        </HView>
      )}
    </VView>
  );
};

type Props = {
  onDismiss: () => void;
  onZoomToMap: (pdfMap: PdfMap) => void;
};

// lets the user choose the PDF maps shown on the maps and their opacity
export const PdfMapsPanel = ({ onDismiss, onZoomToMap }: Props) => {
  const dispatch = useAppDispatch();
  const settings = SettingsSelectors.useSettings();
  const pdfMaps = settings.pdfMaps ?? [];

  const onToggle = useCallback(
    (pdfMap: PdfMap) => {
      void dispatch(
        SettingsActions.updatePdfMap({
          mapId: pdfMap.id,
          changes: { visible: !pdfMap.visible },
        }),
      );
    },
    [dispatch],
  );

  const onOpacityChange = useCallback(
    (pdfMap: PdfMap, value: number) => {
      // slider values can have rounding errors
      const opacity = Math.round(value * 10) / 10;
      void dispatch(
        SettingsActions.updatePdfMap({
          mapId: pdfMap.id,
          changes: { opacity },
        }),
      );
    },
    [dispatch],
  );

  const onZoomToMapPress = useCallback(
    (pdfMap: PdfMap) => {
      onZoomToMap(pdfMap);
      onDismiss();
    },
    [onDismiss, onZoomToMap],
  );

  return (
    <Modal onDismiss={onDismiss} titleKey="pdfMaps:title">
      <ScrollView>
        <VView style={styles.pdfMapItems}>
          {pdfMaps.map((pdfMap) => (
            <PdfMapItem
              key={pdfMap.id}
              pdfMap={pdfMap}
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
