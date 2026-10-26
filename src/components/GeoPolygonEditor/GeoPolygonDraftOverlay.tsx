import React, { useMemo } from "react";
import { View } from "react-native";

import { Marker, Polygon, Polyline } from "react-native-maps";

import { LatLng } from "model";

import styles, { markerCenterAnchor } from "./styles";

type GeoPolygonDraftOverlayProps = {
  coordinates: LatLng[];
  fillColor?: string;
  strokeColor: string | undefined;
  strokeWidth: number | undefined;
  showPoints?: boolean;
  onPolygonPress?: () => void;
};

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
        <Polygon
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
            anchor={markerCenterAnchor}
          >
            <View collapsable={false} style={styles.markerContainer}>
              <View style={markerStyle} />
            </View>
          </Marker>
        ))}
    </>
  );
};
