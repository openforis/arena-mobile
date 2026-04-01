import React, { useMemo } from "react";
import { View as RNView } from "react-native";

import { LatLng, Marker, Polyline } from "react-native-maps";

import styles from "./styles";

type GeoDraftOverlayProps = {
  coordinates: LatLng[];
  strokeColor: string | undefined;
  strokeWidth: number | undefined;
  showPoints?: boolean;
};

const markerAnchor = { x: 0.2, y: 0.2 };

export const GeoDraftOverlay = ({
  coordinates,
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
