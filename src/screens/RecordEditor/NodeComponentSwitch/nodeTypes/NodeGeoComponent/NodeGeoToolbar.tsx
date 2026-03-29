import React from "react";

import { Button, HView, IconButton } from "components";

import styles from "./styles";

interface NodeGeoToolbarProps {
  draftCoordinates: { latitude: number; longitude: number }[];
  editable: boolean;
  hasValue: boolean;
  onCancelDrawing: () => void;
  onCenterOnLocation: () => void;
  onClearPress: () => void;
  onSaveCurrentPolygon: () => void;
  onStartDrawing: () => void;
}

export const NodeGeoToolbar = ({
  draftCoordinates,
  editable,
  hasValue,
  onCancelDrawing,
  onCenterOnLocation,
  onClearPress,
  onSaveCurrentPolygon,
  onStartDrawing,
}: NodeGeoToolbarProps) => (
  <HView style={styles.toolbar}>
    {(hasValue || editable) && (
      <IconButton
        icon="crosshairs-gps"
        onPress={onCenterOnLocation}
        size={24}
      />
    )}
    {editable ? (
      <>
        {(hasValue || draftCoordinates.length >= 3) && (
          <Button onPress={onSaveCurrentPolygon} textKey="common:save" />
        )}
        <Button
          color="secondary"
          onPress={onCancelDrawing}
          textKey="common:cancel"
        />
      </>
    ) : (
      <Button
        icon={hasValue ? "pencil" : "vector-polygon"}
        textKey={
          hasValue ? "dataEntry:geo.editPolygon" : "dataEntry:geo.drawPolygon"
        }
        onPress={onStartDrawing}
      />
    )}
    {hasValue && !editable && (
      <IconButton icon="trash-can-outline" onPress={onClearPress} />
    )}
  </HView>
);
