import React from "react";
import { View as RNView } from "react-native";

import {
  LatLng,
  Marker,
  Polygon as MapPolygon,
  Polyline,
} from "react-native-maps";

import styles from "./styles";

type GeoDraftOverlayProps = {
  coordinates: LatLng[];
  fillColor: string | undefined;
  strokeColor: string | undefined;
  strokeWidth: number | undefined;
  showPoints?: boolean;
};

export const GeoDraftOverlay = ({
  coordinates,
  fillColor,
  strokeColor,
  strokeWidth,
  showPoints = true,
}: GeoDraftOverlayProps) => {
  if (coordinates.length === 0) return null;

  return (
    <>
      {coordinates.length < 3 && (
        <Polyline
          coordinates={coordinates}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
        />
      )}
      {showPoints &&
        coordinates.map((coordinate, index) => (
          <Marker
            key={`draft-point-${index}`}
            coordinate={coordinate}
            anchor={{ x: 0.2, y: 0.2 }}
            tracksViewChanges
            zIndex={2500}
          >
            <RNView style={[styles.draftPoint, { borderColor: strokeColor }]} />
          </Marker>
        ))}
    </>
  );
};
