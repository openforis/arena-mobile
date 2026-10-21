import React, { useEffect, useRef } from "react";
import { StyleProp, View as RNView, ViewStyle } from "react-native";
import { MapMarker, Marker } from "react-native-maps";

import { LatLng } from "model";
import { Environment } from "utils";

import styles, { markerCenterAnchor } from "./styles";

// time to wait for the new marker layout to be applied before redrawing it
const REDRAW_DELAY_MS = 50;

type GeoVertexMarkerProps = {
  // changes when the marker appearance (size) changes
  appearanceKey?: string;
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
  appearanceKey,
  coordinate,
  draggable = false,
  outerStyle,
  coreStyle,
  onPress,
  onDragStart,
  onDrag,
  onDragEnd,
}: GeoVertexMarkerProps) => {
  const markerRef = useRef<MapMarker | null>(null);

  // on Android the marker bitmap can be drawn before its new size is applied, cropping it
  useEffect(() => {
    if (!Environment.isAndroid) return;
    const timer = setTimeout(
      () => markerRef.current?.redraw(),
      REDRAW_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [appearanceKey]);

  return (
    <Marker
      ref={markerRef}
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
};
