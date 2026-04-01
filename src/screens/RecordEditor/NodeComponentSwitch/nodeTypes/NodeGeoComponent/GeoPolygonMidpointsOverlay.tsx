import React from "react";
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

export const GeoPolygonMidpointsOverlay = ({
  midpoints,
  strokeColor,
  onMidpointDragEnd,
}: GeoPolygonMidpointsOverlayProps) => {
  if (midpoints.length === 0) return null;

  return (
    <>
      {midpoints.map(({ key, coordinate, insertAtIndex }) => (
        <Marker
          key={key}
          coordinate={coordinate}
          anchor={{ x: 0.1, y: 0.1 }}
          draggable
          tracksViewChanges
          zIndex={1500}
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
          <RNView
            style={[
              styles.midpoint,
              {
                borderColor: strokeColor ?? "#ffffff",
              },
            ]}
          >
            <RNView
              style={[
                styles.midpointCore,
                {
                  backgroundColor: strokeColor ?? "#007aff",
                },
              ]}
            />
          </RNView>
        </Marker>
      ))}
    </>
  );
};
