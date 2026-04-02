import React, { useCallback } from "react";
import { View as RNView } from "react-native";
import { LatLng, Marker } from "react-native-maps";

import styles from "./styles";

type GeoPolygonVerticesOverlayProps = {
  coordinates: LatLng[];
  strokeColor: string | undefined;
  selectedVertexIndex: number | null;
  onVertexPress: (index: number) => void;
};

const markerAnchor = { x: 0.2, y: 0.2 };

export const GeoPolygonVerticesOverlay = ({
  coordinates,
  strokeColor,
  selectedVertexIndex,
  onVertexPress,
}: GeoPolygonVerticesOverlayProps) => {
  const markerColor = strokeColor ?? "#ffffff";

  const markerStyleByIndex = useCallback(
    (index: number) => [
      styles.vertexPoint,
      selectedVertexIndex === index && styles.vertexPointSelected,
      { borderColor: markerColor },
    ],
    [markerColor, selectedVertexIndex],
  );

  const markerCoreStyleByIndex = useCallback(
    (index: number) => [
      styles.vertexPointCore,
      selectedVertexIndex === index && styles.vertexPointCoreSelected,
      { backgroundColor: markerColor },
    ],
    [markerColor, selectedVertexIndex],
  );

  if (coordinates.length === 0) return null;

  return (
    <>
      {coordinates.map((coordinate, index) => (
        <Marker
          key={`polygon-vertex-${index}-${coordinate.latitude}-${coordinate.longitude}`}
          coordinate={coordinate}
          anchor={markerAnchor}
          onPress={(event) => {
            event.stopPropagation();
            onVertexPress(index);
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
