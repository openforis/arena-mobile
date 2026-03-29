import React, { useMemo } from "react";

import { MapPolygonExtendedProps } from "@siposdani87/expo-maps-polygon-editor";
import { LatLng, MarkerPressEvent } from "react-native-maps";

import { NodeGeoMapMarker } from "./NodeGeoMapMarker";
import styles from "./styles";

interface PolygonMidpoint {
  coordinate: LatLng;
  insertAtIndex: number;
}

interface NodeGeoMidpointsLayerProps {
  midpoints: PolygonMidpoint[];
  strokeColor: MapPolygonExtendedProps["strokeColor"];
  onMidpointPress: (insertAtIndex: number) => (event: MarkerPressEvent) => void;
}

export const NodeGeoMidpointsLayer = ({
  midpoints,
  strokeColor,
  onMidpointPress,
}: NodeGeoMidpointsLayerProps) => {
  const style = useMemo(
    () => [styles.midpoint, { borderColor: strokeColor }],
    [strokeColor],
  );
  return (
    <>
      {midpoints.map(({ coordinate, insertAtIndex }, index) => (
        <NodeGeoMapMarker
          key={`polygon-midpoint-${index}`}
          markerKey={`polygon-midpoint-${index}`}
          coordinate={coordinate}
          style={style}
          onPress={onMidpointPress(insertAtIndex)}
        />
      ))}
    </>
  );
};
