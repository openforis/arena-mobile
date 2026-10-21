import React from "react";
import { StyleProp, View as RNView, ViewStyle } from "react-native";
import { Marker } from "react-native-maps";

import { LatLng } from "model";

import styles, { markerCenterAnchor } from "./styles";

type GeoVertexMarkerProps = {
  coordinate: LatLng;
  draggable?: boolean;
  outerStyle: StyleProp<ViewStyle>;
  coreStyle: StyleProp<ViewStyle>;
  onPress?: () => void;
  onDragStart?: () => void;
  onDrag?: (coordinate: LatLng) => void;
  onDragEnd?: (coordinate: LatLng) => void;
};

export const GeoVertexMarker = ({
  coordinate,
  draggable = false,
  outerStyle,
  coreStyle,
  onPress,
  onDragStart,
  onDrag,
  onDragEnd,
}: GeoVertexMarkerProps) => (
  <Marker
    coordinate={coordinate}
    anchor={markerCenterAnchor}
    draggable={draggable}
    onPress={(event) => {
      event.stopPropagation();
      onPress?.();
    }}
    onDragStart={(event) => {
      event.stopPropagation();
      onDragStart?.();
    }}
    onDrag={(event) => {
      event.stopPropagation();
      const draggedCoordinate = event.nativeEvent?.coordinate;
      if (!draggedCoordinate) return;
      onDrag?.(draggedCoordinate);
    }}
    onDragEnd={(event) => {
      event.stopPropagation();
      const draggedCoordinate = event.nativeEvent?.coordinate;
      if (!draggedCoordinate) return;
      onDragEnd?.(draggedCoordinate);
    }}
  >
    <RNView style={styles.markerContainer}>
      <RNView style={outerStyle}>
        <RNView style={coreStyle} />
      </RNView>
    </RNView>
  </Marker>
);
