import React from "react";
import { View as RNView } from "react-native";
import { LatLng, Marker } from "react-native-maps";

import styles from "./styles";

type GeoPolygonVerticesOverlayProps = {
  coordinates: LatLng[];
  strokeColor: string | undefined;
};

export const GeoPolygonVerticesOverlay = ({
  coordinates,
  strokeColor,
}: GeoPolygonVerticesOverlayProps) => {
  if (coordinates.length === 0) return null;

  return (
    <>
      {coordinates.map((coordinate, index) => (
        <Marker
          key={`polygon-vertex-${index}`}
          coordinate={coordinate}
          anchor={{ x: 0.2, y: 0.2 }}
          tracksViewChanges
          tappable={false}
        >
          <RNView
            style={[
              styles.vertexPoint,
              {
                borderColor: strokeColor ?? "#ffffff",
              },
            ]}
          >
            <RNView
              style={[
                styles.vertexPointCore,
                {
                  backgroundColor: strokeColor ?? "#ffffff",
                },
              ]}
            />
          </RNView>
        </Marker>
      ))}
    </>
  );
};
