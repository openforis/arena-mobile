import React, { useMemo } from "react";

import { MapPolygonExtendedProps } from "@siposdani87/expo-maps-polygon-editor";
import { MarkerPressEvent } from "react-native-maps";

import { NodeGeoMapMarker } from "./NodeGeoMapMarker";
import { PolygonMidpoint } from "./types";
import styles from "./styles";

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
      {midpoints.map(({ uuid, coordinate, insertAtIndex }) => (
        <NodeGeoMapMarker
          key={`polygon-midpoint-${uuid}`}
          markerKey={`polygon-midpoint-${uuid}`}
          coordinate={coordinate}
          style={style}
          onPress={onMidpointPress(insertAtIndex)}
        />
      ))}
    </>
  );
};
