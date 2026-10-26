import React from "react";
import { View } from "react-native";

import { ChoiceItem, Modal, ScrollView, Text, VView } from "components";

import {
  notVisitedSamplingPointColor,
  RecordsMapLayer,
  RecordsMapLayerType,
  visitedSamplingPointColor,
} from "./recordsMapLayers";
import styles from "./styles";

type LayerItem = {
  layer: RecordsMapLayer;
  label: string;
  // null when not loaded yet (tracks are loaded only when their layer is visible)
  pointsCount: number | null;
};

type Props = {
  layerItems: LayerItem[];
  onDismiss: () => void;
  onLayerToggle: (layerKey: string) => void;
  visibleLayerKeys: string[];
};

const LegendItem = ({ color, textKey }: { color: string; textKey: string }) => (
  <View style={styles.legendItem}>
    <View style={[styles.layerColor, { backgroundColor: color }]} />
    <Text textKey={textKey} />
  </View>
);

type LayerChoiceItemProps = LayerItem & {
  checked: boolean;
  onPress: () => void;
};

// same look as the items of MapAppChooserDialog: checkbox on the left, label wrapping on more lines
const LayerChoiceItem = (props: LayerChoiceItemProps) => {
  const { checked, label, layer, onPress, pointsCount } = props;
  return (
    <ChoiceItem
      contentStyle={styles.layerItemContent}
      multiple
      onPress={onPress}
      selected={checked}
      style={styles.layerItem}
    >
      {layer.type !== RecordsMapLayerType.samplingPoints && (
        <View style={[styles.layerColor, { backgroundColor: layer.color }]} />
      )}
      <VView style={styles.layerItemTexts}>
        <Text variant="bodyLarge">{label}</Text>
        {pointsCount !== null && (
          <Text
            textKey={
              layer.type === RecordsMapLayerType.positionTrack
                ? "recordsMap:tracksCount"
                : "recordsMap:pointsCount"
            }
            textParams={{ count: pointsCount }}
            variant="bodySmall"
          />
        )}
      </VView>
    </ChoiceItem>
  );
};

export const RecordsMapLayersPanel = (props: Props) => {
  const { layerItems, onDismiss, onLayerToggle, visibleLayerKeys } = props;

  const hasSamplingPointLayers = layerItems.some(
    ({ layer }) => layer.type === RecordsMapLayerType.samplingPoints,
  );

  return (
    <Modal onDismiss={onDismiss} titleKey="recordsMap:layers">
      <ScrollView>
        <VView style={styles.layerItems}>
          {layerItems.map((layerItem) => (
            <LayerChoiceItem
              key={layerItem.layer.key}
              {...layerItem}
              checked={visibleLayerKeys.includes(layerItem.layer.key)}
              onPress={() => onLayerToggle(layerItem.layer.key)}
            />
          ))}
        </VView>
        {hasSamplingPointLayers && (
          <View style={styles.legend}>
            <LegendItem
              color={visitedSamplingPointColor}
              textKey="recordsMap:samplingPointVisited"
            />
            <LegendItem
              color={notVisitedSamplingPointColor}
              textKey="recordsMap:samplingPointNotVisited"
            />
          </View>
        )}
        <Text textKey="recordsMap:dataSourceInfo" variant="bodySmall" />
      </ScrollView>
    </Modal>
  );
};
