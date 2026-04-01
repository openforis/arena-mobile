import React, { useMemo } from "react";
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
  fillColor?: string;
  strokeColor: string | undefined;
  strokeWidth: number | undefined;
  showPoints?: boolean;
};

const markerAnchor = { x: 0.2, y: 0.2 };

export const GeoDraftOverlay = ({
  coordinates,
  fillColor,
  strokeColor,
  strokeWidth,
  showPoints = true,
}: GeoDraftOverlayProps) => {
  const markerStyle = useMemo(
    () => [styles.draftPoint, { borderColor: strokeColor }],
    [strokeColor],
  );

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
      {showPoints &&
        coordinates.map((coordinate, index) => (
          <Marker
            key={`draft-point-${index}`}
            coordinate={coordinate}
            anchor={markerAnchor}
            tracksViewChanges
            zIndex={2500}
          >
            <RNView style={markerStyle} />
          </Marker>
        ))}
    </>
  );
};
