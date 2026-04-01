import React from "react";
import { View as RNView } from "react-native";
import { LatLng, Marker } from "react-native-maps";

import styles from "./styles";

export type GeoPolygonMidpoint = {
  key: string;
  coordinate: LatLng;
  insertAtIndex: number;
};

type GeoPolygonMidpointsOverlayProps = {
  midpoints: GeoPolygonMidpoint[];
  strokeColor: string | undefined;
  onMidpointPress: (insertAtIndex: number) => void;
};

export const GeoPolygonMidpointsOverlay = ({
  midpoints,
  strokeColor,
  onMidpointPress,
}: GeoPolygonMidpointsOverlayProps) => {
  if (midpoints.length === 0) return null;

  return (
    <>
      {midpoints.map(({ key, coordinate, insertAtIndex }) => (
        <Marker
          key={key}
          coordinate={coordinate}
          anchor={{ x: 0.1, y: 0.1 }}
          tracksViewChanges={true}
          zIndex={1500}
          onPress={(event) => {
            event.stopPropagation();
            onMidpointPress(insertAtIndex);
          }}
        >
          <RNView
            style={[
              styles.midpoint,
              {
                borderColor: strokeColor ?? "#ffffff",
              },
            ]}
          >
            <RNView
              style={[
                styles.midpointCore,
                {
                  backgroundColor: strokeColor ?? "#007aff",
                },
              ]}
            />
          </RNView>
        </Marker>
      ))}
    </>
  );
};
