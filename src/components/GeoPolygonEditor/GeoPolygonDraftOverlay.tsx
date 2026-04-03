import React, { useMemo } from "react";
import { View as RNView } from "react-native";

import { Marker, Polygon as MapPolygon, Polyline } from "react-native-maps";

import { LatLng } from "model";

import styles from "./styles";

type GeoPolygonDraftOverlayProps = {
  coordinates: LatLng[];
  fillColor?: string;
  strokeColor: string | undefined;
  strokeWidth: number | undefined;
  showPoints?: boolean;
  onPolygonPress?: () => void;
};

const markerAnchor = { x: 0.2, y: 0.2 };

export const GeoPolygonDraftOverlay = ({
  coordinates,
  fillColor,
  strokeColor,
  strokeWidth,
  showPoints = true,
  onPolygonPress,
}: GeoPolygonDraftOverlayProps) => {
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
          tappable
          onPress={(event) => {
            event.stopPropagation();
            onPolygonPress?.();
          }}
        />
      ) : (
        <Polyline
          coordinates={coordinates}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
        />
      )}
      {showPoints &&
        coordinates.map((coordinate) => (
          <Marker
            key={`draft-point-${coordinate.latitude}-${coordinate.longitude}`}
            coordinate={coordinate}
            anchor={markerAnchor}
          >
            <RNView style={markerStyle} />
          </Marker>
        ))}
    </>
  );
};
