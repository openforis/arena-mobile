import React from "react";
import { View as RNView, StyleProp, ViewStyle } from "react-native";

import { LatLng, Marker, MarkerPressEvent } from "react-native-maps";

interface NodeGeoMapMarkerProps {
  coordinate: LatLng;
  markerKey: string;
  style: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  onPress?: (event: MarkerPressEvent) => void;
}

const anchor = { x: 0.5, y: 0.5 };

export const NodeGeoMapMarker = ({
  coordinate,
  markerKey,
  style,
  children,
  onPress,
}: NodeGeoMapMarkerProps) => (
  <Marker
    key={markerKey}
    coordinate={coordinate}
    anchor={anchor}
    tracksViewChanges
    onPress={onPress}
  >
    <RNView collapsable={false} style={style}>
      {children}
    </RNView>
  </Marker>
);
