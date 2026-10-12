import React from "react";
import { Surface } from "react-native-paper";

import {
  Button,
  CloseIconButton,
  HView,
  OpenMapButton,
  ScrollView,
  Text,
  VView,
} from "components";

import {
  RecordsMapLayerType,
  RecordsMapPointProperties,
} from "./recordsMapLayers";
import styles from "./styles";

export type RecordsMapSelection = {
  layerLabel: string;
  layerType: RecordsMapLayerType;
  points: RecordsMapPointProperties[];
};

type Props = {
  onDismiss: () => void;
  onRecordPress: (recordUuid: string) => void;
  recordLabelByUuid: Record<string, string>;
  selection: RecordsMapSelection;
};

export const RecordsMapSelectionPanel = (props: Props) => {
  const { onDismiss, onRecordPress, recordLabelByUuid, selection } = props;
  const { layerLabel, layerType, points } = selection;
  const isSamplingPointsLayer =
    layerType === RecordsMapLayerType.samplingPoints;

  return (
    <Surface elevation={2} style={styles.bottomPanel}>
      <HView style={styles.bottomPanelHeader}>
        <Text style={styles.bottomPanelTitle} variant="titleSmall">
          {layerLabel}
        </Text>
        <CloseIconButton onPress={onDismiss} />
      </HView>
      <ScrollView>
        {points.map((point) => (
          <VView key={point.key} style={styles.pointItem}>
            {isSamplingPointsLayer && (
              <HView style={styles.recordItem}>
                <Text
                  style={styles.recordItemLabel}
                  textKey={
                    point.visited
                      ? "recordsMap:samplingPointVisitedWithCode"
                      : "recordsMap:samplingPointNotVisitedWithCode"
                  }
                  textParams={{ code: point.label }}
                />
                <OpenMapButton point={point.point} size={20} />
              </HView>
            )}
            {point.recordUuids.map((recordUuid) => (
              <HView key={recordUuid} style={styles.recordItem}>
                <Text style={styles.recordItemLabel}>
                  {recordLabelByUuid[recordUuid] ?? point.label}
                </Text>
                {!isSamplingPointsLayer && (
                  <OpenMapButton point={point.point} size={20} />
                )}
                <Button
                  compact
                  icon="pencil"
                  mode="text"
                  onPress={() => onRecordPress(recordUuid)}
                  textKey="recordsMap:openRecord"
                />
              </HView>
            ))}
          </VView>
        ))}
      </ScrollView>
    </Surface>
  );
};
