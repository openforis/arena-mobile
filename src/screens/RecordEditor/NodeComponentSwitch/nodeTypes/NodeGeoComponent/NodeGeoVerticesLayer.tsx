import React, { useMemo } from "react";
import { StyleSheet, View as RNView } from "react-native";

import { MapPolygonExtendedProps } from "@siposdani87/expo-maps-polygon-editor";
import { Marker } from "react-native-maps";

interface NodeGeoVerticesLayerProps {
  polygon: MapPolygonExtendedProps;
}

const styles = StyleSheet.create({
  vertexPoint: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  vertexPointInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

const anchor = { x: 0.5, y: 0.5 };

export const NodeGeoVerticesLayer = ({
  polygon,
}: NodeGeoVerticesLayerProps) => {
  const markerStyle = useMemo(
    () => [styles.vertexPoint, { borderColor: polygon.strokeColor }],
    [polygon.strokeColor],
  );

  const markerInnerStyle = useMemo(
    () => [styles.vertexPointInner, { backgroundColor: polygon.strokeColor }],
    [polygon.strokeColor],
  );

  return (
    <>
      {polygon.coordinates.map((coordinate, index) => (
        <Marker
          key={`polygon-vertex-${index}`}
          coordinate={coordinate}
          anchor={anchor}
          tracksViewChanges={true}
          tappable={false}
        >
          <RNView collapsable={false} style={markerStyle}>
            <RNView collapsable={false} style={markerInnerStyle} />
          </RNView>
        </Marker>
      ))}
    </>
  );
};
