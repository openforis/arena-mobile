import { LatLng } from "react-native-maps";
import React from "react";

import { Button, HView, IconButton } from "components";

import styles from "./styles";

interface NodeGeoEditorContentToolbarProps {
  draftCoordinates: LatLng[];
  hasValue: boolean;
  onCancelDrawing: () => void;
  onCenterOnLocation: () => void;
  onSaveCurrentPolygon: () => void;
}

export const NodeGeoEditorContentToolbar = ({
  draftCoordinates,
  hasValue,
  onCancelDrawing,
  onCenterOnLocation,
  onSaveCurrentPolygon,
}: NodeGeoEditorContentToolbarProps) => (
  <HView style={styles.toolbar}>
    <IconButton icon="crosshairs-gps" onPress={onCenterOnLocation} size={24} />
    {(hasValue || draftCoordinates.length >= 3) && (
      <Button
        icon="content-save"
        onPress={onSaveCurrentPolygon}
        textKey="common:save"
      />
    )}
    <Button
      color="secondary"
      onPress={onCancelDrawing}
      textKey="common:cancel"
    />
  </HView>
);
