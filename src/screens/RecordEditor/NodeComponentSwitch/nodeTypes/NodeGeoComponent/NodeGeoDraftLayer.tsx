import React, { useMemo } from "react";
import { View as RNView } from "react-native";

import { MapPolygonExtendedProps } from "@siposdani87/expo-maps-polygon-editor";
import { Polygon as MapPolygon, Polyline, LatLng } from "react-native-maps";

import { NodeGeoMapMarker } from "./NodeGeoMapMarker";
import styles from "./styles";

interface NodeGeoDraftLayerProps {
  draftCoordinates: LatLng[];
  newPolygon: MapPolygonExtendedProps;
}

export const NodeGeoDraftLayer = ({
  draftCoordinates,
  newPolygon,
}: NodeGeoDraftLayerProps) => {
  const { fillColor, strokeColor, strokeWidth } = newPolygon;

  const markerStyle = useMemo(
    () => [styles.draftPoint, { borderColor: strokeColor }],
    [strokeColor],
  );

  const markerInnerStyle = useMemo(
    () => [styles.draftPointInner, { backgroundColor: strokeColor }],
    [strokeColor],
  );

  if (draftCoordinates.length === 0) return null;

  const lineStrokeWidth = Math.max(strokeWidth ?? 2, 4);
  const coordinateOccurrences = new Map<string, number>();

  return (
    <>
      {draftCoordinates.length >= 3 ? (
        <MapPolygon
          coordinates={draftCoordinates}
          strokeColor={strokeColor}
          strokeWidth={lineStrokeWidth}
          fillColor={fillColor}
        />
      ) : (
        <Polyline
          coordinates={draftCoordinates}
          strokeColor={strokeColor}
          strokeWidth={lineStrokeWidth}
        />
      )}
      {draftCoordinates.map((coordinate) => {
        const coordinateKey = `${coordinate.latitude}-${coordinate.longitude}`;
        const occurrence = coordinateOccurrences.get(coordinateKey) ?? 0;
        coordinateOccurrences.set(coordinateKey, occurrence + 1);
        const markerKey = `draft-point-${coordinateKey}-${occurrence}`;

        return (
          <NodeGeoMapMarker
            key={markerKey}
            markerKey={markerKey}
            coordinate={coordinate}
            style={markerStyle}
          >
            <RNView collapsable={false} style={markerInnerStyle} />
          </NodeGeoMapMarker>
        );
      })}
    </>
  );
};
