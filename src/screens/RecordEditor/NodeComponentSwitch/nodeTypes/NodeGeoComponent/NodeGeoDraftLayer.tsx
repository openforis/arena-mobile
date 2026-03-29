import React from "react";
import { View as RNView } from "react-native";

import { MapPolygonExtendedProps } from "@siposdani87/expo-maps-polygon-editor";
import {
  Polygon as MapPolygon,
  Marker,
  Polyline,
  LatLng,
} from "react-native-maps";

import styles from "./styles";

interface NodeGeoDraftLayerProps {
  draftCoordinates: LatLng[];
  newPolygon: MapPolygonExtendedProps;
}

export const NodeGeoDraftLayer = ({
  draftCoordinates,
  newPolygon,
}: NodeGeoDraftLayerProps) => {
  if (draftCoordinates.length === 0) return null;

  return (
    <>
      {draftCoordinates.length >= 3 ? (
        <MapPolygon
          coordinates={draftCoordinates}
          strokeColor={newPolygon.strokeColor}
          strokeWidth={Math.max(newPolygon.strokeWidth ?? 2, 4)}
          fillColor={newPolygon.fillColor}
        />
      ) : (
        <Polyline
          coordinates={draftCoordinates}
          strokeColor={newPolygon.strokeColor}
          strokeWidth={Math.max(newPolygon.strokeWidth ?? 2, 4)}
        />
      )}
      {draftCoordinates.map((coordinate, index) => (
        <Marker
          key={`draft-point-${index}`}
          coordinate={coordinate}
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={true}
        >
          <RNView
            collapsable={false}
            style={[styles.draftPoint, { borderColor: newPolygon.strokeColor }]}
          >
            <RNView
              collapsable={false}
              style={[
                styles.draftPointInner,
                { backgroundColor: newPolygon.strokeColor },
              ]}
            />
          </RNView>
        </Marker>
      ))}
    </>
  );
};
