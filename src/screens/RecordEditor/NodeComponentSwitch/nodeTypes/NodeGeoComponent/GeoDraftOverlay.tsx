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
      {coordinates.map((coordinate, index) => (
        <Marker
          key={`draft-point-${index}`}
          coordinate={coordinate}
          anchor={{ x: 0.1, y: 0.1 }}
          tracksViewChanges
          zIndex={1000}
        >
          <RNView style={[styles.draftPoint, { borderColor: strokeColor }]} />
        </Marker>
      ))}
    </>
  );
};
