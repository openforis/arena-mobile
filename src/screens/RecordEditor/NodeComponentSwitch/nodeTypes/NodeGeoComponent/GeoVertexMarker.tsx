import React from "react";
import { StyleProp, View as RNView, ViewStyle } from "react-native";
import { Marker } from "react-native-maps";

import { LatLng } from "model";

type GeoVertexMarkerProps = {
  coordinate: LatLng;
  anchor: { x: number; y: number };
  outerStyle: StyleProp<ViewStyle>;
  coreStyle: StyleProp<ViewStyle>;
  onPress?: () => void;
  onDragStart: () => void;
  onDrag: (coordinate: LatLng) => void;
  onDragEnd: (coordinate: LatLng) => void;
};

export const GeoVertexMarker = ({
  coordinate,
  anchor,
  outerStyle,
  coreStyle,
  onPress,
  onDragStart,
  onDrag,
  onDragEnd,
}: GeoVertexMarkerProps) => (
  <Marker
    coordinate={coordinate}
    anchor={anchor}
    draggable
    onPress={(event) => {
      event.stopPropagation();
      onPress?.();
    }}
    onDragStart={(event) => {
      event.stopPropagation();
      onDragStart();
    }}
    onDrag={(event) => {
      event.stopPropagation();
      const draggedCoordinate = event.nativeEvent?.coordinate;
      if (!draggedCoordinate) return;
      onDrag(draggedCoordinate);
    }}
    onDragEnd={(event) => {
      event.stopPropagation();
      const draggedCoordinate = event.nativeEvent?.coordinate;
      if (!draggedCoordinate) return;
      onDragEnd(draggedCoordinate);
    }}
  >
    <RNView style={outerStyle}>
      <RNView style={coreStyle} />
    </RNView>
  </Marker>
);
