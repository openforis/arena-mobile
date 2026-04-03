import React, { useCallback } from "react";
import { View as RNView } from "react-native";
import { Marker } from "react-native-maps";

import { LatLng } from "model";

import styles from "./styles";

type GeoPolygonVerticesOverlayProps = {
  coordinates: LatLng[];
  strokeColor: string | undefined;
  selectedVertexIndex: number | null;
  draggingVertexIndex: number | null;
  onVertexPress: (index: number) => void;
  onVertexDragStart: (index: number) => void;
  onVertexDrag: (index: number, coordinate: LatLng) => void;
  onVertexDragEnd: (index: number, coordinate: LatLng) => void;
};

const markerAnchor = { x: 0.2, y: 0.2 };
const selectedMarkerAnchor = { x: 0.35, y: 0.35 };

export const GeoPolygonVerticesOverlay = ({
  coordinates,
  strokeColor,
  selectedVertexIndex,
  draggingVertexIndex,
  onVertexPress,
  onVertexDragStart,
  onVertexDrag,
  onVertexDragEnd,
}: GeoPolygonVerticesOverlayProps) => {
  const markerColor = strokeColor ?? "#ffffff";

  const markerStyleByIndex = useCallback(
    (index: number) => [
      styles.vertexPoint,
      selectedVertexIndex === index && styles.vertexPointSelected,
      draggingVertexIndex === index && styles.vertexPointDragging,
      { borderColor: markerColor },
    ],
    [draggingVertexIndex, markerColor, selectedVertexIndex],
  );

  const markerCoreStyleByIndex = useCallback(
    (index: number) => [
      styles.vertexPointCore,
      selectedVertexIndex === index && styles.vertexPointCoreSelected,
      draggingVertexIndex === index && styles.vertexPointCoreDragging,
      { backgroundColor: markerColor },
    ],
    [draggingVertexIndex, markerColor, selectedVertexIndex],
  );

  if (coordinates.length === 0) return null;

  return (
    <>
      {coordinates.map((coordinate, index) => (
        <Marker
          key={`polygon-vertex-${coordinate.latitude}-${coordinate.longitude}`}
          coordinate={coordinate}
          anchor={
            index === selectedVertexIndex ? selectedMarkerAnchor : markerAnchor
          }
          draggable
          onPress={(event) => {
            event.stopPropagation();
            onVertexPress(index);
          }}
          onDragStart={(event) => {
            event.stopPropagation();
            onVertexDragStart(index);
          }}
          onDrag={(event) => {
            event.stopPropagation();
            const draggedCoordinate = event.nativeEvent?.coordinate;
            if (!draggedCoordinate) return;
            onVertexDrag(index, draggedCoordinate);
          }}
          onDragEnd={(event) => {
            event.stopPropagation();
            const draggedCoordinate = event.nativeEvent?.coordinate;
            if (!draggedCoordinate) return;
            onVertexDragEnd(index, draggedCoordinate);
          }}
        >
          <RNView style={markerStyleByIndex(index)}>
            <RNView style={markerCoreStyleByIndex(index)} />
          </RNView>
        </Marker>
      ))}
    </>
  );
};
