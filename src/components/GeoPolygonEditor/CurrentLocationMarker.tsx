import React from "react";
import { Marker } from "react-native-maps";

import { LatLng } from "model";

import { View } from "../View";

import styles from "./styles";

type CurrentLocationMarkerProps = {
  coordinate: LatLng;
};

const anchor = { x: 0.4, y: 0.4 };

export const CurrentLocationMarker = ({
  coordinate,
}: CurrentLocationMarkerProps) => (
  <Marker coordinate={coordinate} anchor={anchor} tappable={false}>
    <View style={styles.currentLocationMarker}>
      <View style={styles.currentLocationMarkerHorizontal} />
      <View style={styles.currentLocationMarkerVertical} />
    </View>
  </Marker>
);
