import React, { useMemo } from "react";
import { View as RNView } from "react-native";
import { Marker } from "react-native-maps";

import { LatLng } from "model";

import styles, { midpointDefaultBorderColor } from "./styles";

export type GeoPolygonMidpoint = {
  key: string;
  coordinate: LatLng;
  insertAtIndex: number;
};

type GeoPolygonMidpointsOverlayProps = {
  midpoints: GeoPolygonMidpoint[];
  strokeColor: string | undefined;
  draggingMidpointInsertAtIndex: number | null;
  onMidpointDragStart: (insertAtIndex: number) => void;
  onMidpointDrag: (insertAtIndex: number, coordinate: LatLng) => void;
  onMidpointDragEnd: (insertAtIndex: number, coordinate: LatLng) => void;
};

const markerAnchor = { x: 0.13, y: 0.13 };

export const GeoPolygonMidpointsOverlay = ({
  midpoints,
  strokeColor,
  draggingMidpointInsertAtIndex,
  onMidpointDragStart,
  onMidpointDrag,
  onMidpointDragEnd,
}: GeoPolygonMidpointsOverlayProps) => {
  const styleByInsertAtIndex = useMemo(
    () => (insertAtIndex: number) => [
      styles.midpoint,
      draggingMidpointInsertAtIndex === insertAtIndex &&
        styles.midpointDragging,
      { borderColor: strokeColor ?? midpointDefaultBorderColor },
    ],
    [draggingMidpointInsertAtIndex, strokeColor],
  );

  if (midpoints.length === 0) return null;

  return (
    <>
      {midpoints.map(({ coordinate, insertAtIndex }) => (
        <Marker
          key={`polygon-midpoint-${insertAtIndex}`}
          coordinate={coordinate}
          anchor={markerAnchor}
          draggable
          onPress={(event) => {
            // Keep map onPress from firing while interacting with midpoint marker.
            event.stopPropagation();
          }}
          onDragStart={(event) => {
            event.stopPropagation();
            onMidpointDragStart(insertAtIndex);
          }}
          onDrag={(event) => {
            event.stopPropagation();
            const draggedCoordinate = event.nativeEvent?.coordinate;
            if (!draggedCoordinate) return;
            onMidpointDrag(insertAtIndex, draggedCoordinate);
          }}
          onDragEnd={(event) => {
            event.stopPropagation();
            const draggedCoordinate = event.nativeEvent?.coordinate;
            if (!draggedCoordinate) return;
            onMidpointDragEnd(insertAtIndex, draggedCoordinate);
          }}
        >
          <RNView style={styleByInsertAtIndex(insertAtIndex)} />
        </Marker>
      ))}
    </>
  );
};
