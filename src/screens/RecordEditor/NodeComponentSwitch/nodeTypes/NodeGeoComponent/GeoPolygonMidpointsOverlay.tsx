import React, { useMemo } from "react";
import { View as RNView } from "react-native";
import { LatLng, Marker } from "react-native-maps";

import styles from "./styles";

export type GeoPolygonMidpoint = {
  key: string;
  coordinate: LatLng;
  insertAtIndex: number;
};

type GeoPolygonMidpointsOverlayProps = {
  midpoints: GeoPolygonMidpoint[];
  strokeColor: string | undefined;
  onMidpointDragEnd: (insertAtIndex: number, coordinate: LatLng) => void;
};

const markerAnchor = { x: 0.1, y: 0.1 };

export const GeoPolygonMidpointsOverlay = ({
  midpoints,
  strokeColor,
  onMidpointDragEnd,
}: GeoPolygonMidpointsOverlayProps) => {
  const markerStyle = useMemo(
    () => [styles.midpoint, { borderColor: strokeColor ?? "#ffffff" }],
    [strokeColor],
  );

  if (midpoints.length === 0) return null;

  return (
    <>
      {midpoints.map(({ key, coordinate, insertAtIndex }) => (
        <Marker
          key={key}
          coordinate={coordinate}
          anchor={markerAnchor}
          draggable
          tracksViewChanges
          onPress={(event) => {
            // Keep map onPress from firing while interacting with midpoint marker.
            event.stopPropagation();
          }}
          onDragEnd={(event) => {
            event.stopPropagation();
            const draggedCoordinate = event.nativeEvent?.coordinate;
            if (!draggedCoordinate) return;
            onMidpointDragEnd(insertAtIndex, draggedCoordinate);
          }}
        >
          <RNView style={markerStyle} />
        </Marker>
      ))}
    </>
  );
};
