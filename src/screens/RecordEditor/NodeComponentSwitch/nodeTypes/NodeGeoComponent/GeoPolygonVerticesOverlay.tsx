import React, { useMemo } from "react";
import { View as RNView } from "react-native";
import { LatLng, Marker } from "react-native-maps";

import styles from "./styles";

type GeoPolygonVerticesOverlayProps = {
  coordinates: LatLng[];
  strokeColor: string | undefined;
};

const markerAnchor = { x: 0.2, y: 0.2 };

export const GeoPolygonVerticesOverlay = ({
  coordinates,
  strokeColor,
}: GeoPolygonVerticesOverlayProps) => {
  const markerColor = strokeColor ?? "#ffffff";

  const markerStyle = useMemo(
    () => [styles.vertexPoint, { borderColor: markerColor }],
    [markerColor],
  );

  const markerCoreStyle = useMemo(
    () => [styles.vertexPointCore, { backgroundColor: markerColor }],
    [markerColor],
  );

  if (coordinates.length === 0) return null;

  return (
    <>
      {coordinates.map((coordinate, index) => (
        <Marker
          key={`polygon-vertex-${index}`}
          coordinate={coordinate}
          anchor={markerAnchor}
          tracksViewChanges
          tappable={false}
        >
          <RNView style={markerStyle}>
            <RNView style={markerCoreStyle} />
          </RNView>
        </Marker>
      ))}
    </>
  );
};
