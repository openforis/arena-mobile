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
};

export const GeoDraftOverlay = ({
  coordinates,
  fillColor,
  strokeColor,
  strokeWidth,
}: GeoDraftOverlayProps) => {
  if (coordinates.length === 0) return null;

  return (
    <>
      {coordinates.length >= 3 ? (
        <MapPolygon
          coordinates={coordinates}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          fillColor={fillColor}
        />
      ) : (
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
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={false}
        >
          <RNView style={[styles.draftPoint, { borderColor: strokeColor }]} />
        </Marker>
      ))}
    </>
  );
};
