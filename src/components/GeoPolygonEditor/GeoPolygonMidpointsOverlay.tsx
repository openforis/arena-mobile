import React, { useMemo } from "react";

import { LatLng } from "model";

import { GeoVertexMarker } from "./GeoVertexMarker";
import styles, { midpointDefaultBorderColor } from "./styles";

export type GeoPolygonMidpoint = {
  key: string;
  coordinate: LatLng;
  insertAtIndex: number;
};

type GeoPolygonMidpointsOverlayProps = {
  midpoints: GeoPolygonMidpoint[];
  strokeColor: string | undefined;
  onMidpointPress: (insertAtIndex: number, coordinate: LatLng) => void;
};

const markerAnchor = { x: 0.13, y: 0.13 };

export const GeoPolygonMidpointsOverlay = ({
  midpoints,
  strokeColor,
  onMidpointPress,
}: GeoPolygonMidpointsOverlayProps) => {
  const markerColor = strokeColor ?? midpointDefaultBorderColor;

  const outerStyle = useMemo(
    () => [styles.midpoint, { borderColor: markerColor }],
    [markerColor],
  );

  const coreStyle = useMemo(
    () => [styles.vertexPointCore, { backgroundColor: markerColor }],
    [markerColor],
  );

  if (midpoints.length === 0) return null;

  return (
    <>
      {midpoints.map(({ key, coordinate, insertAtIndex }) => (
        <GeoVertexMarker
          key={`polygon-midpoint-${key}`}
          coordinate={coordinate}
          anchor={markerAnchor}
          outerStyle={outerStyle}
          coreStyle={coreStyle}
          onPress={() => onMidpointPress(insertAtIndex, coordinate)}
        />
      ))}
    </>
  );
};
