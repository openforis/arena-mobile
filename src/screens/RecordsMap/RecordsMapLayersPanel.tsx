import React from "react";
import { View } from "react-native";

import { Checkbox, HView, Modal, ScrollView, Text } from "components";

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
  pointsCount: number;
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

export const RecordsMapLayersPanel = (props: Props) => {
  const { layerItems, onDismiss, onLayerToggle, visibleLayerKeys } = props;

  const hasSamplingPointLayers = layerItems.some(
    ({ layer }) => layer.type === RecordsMapLayerType.samplingPoints,
  );

  return (
    <Modal onDismiss={onDismiss} titleKey="recordsMap:layers">
      <ScrollView>
        {layerItems.map(({ layer, label, pointsCount }) => (
          <HView key={layer.key} style={styles.layerItem}>
            {layer.type === RecordsMapLayerType.coordinateAttribute && (
              <View
                style={[styles.layerColor, { backgroundColor: layer.color }]}
              />
            )}
            <Checkbox
              checked={visibleLayerKeys.includes(layer.key)}
              label={`${label} (${pointsCount})`}
              labelIsI18nKey={false}
              onPress={() => onLayerToggle(layer.key)}
              style={styles.layerCheckbox}
            />
          </HView>
        ))}
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
