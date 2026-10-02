import React from "react";
import { Marker } from "react-native-maps";

import { LatLng } from "model";

import { View } from "../View";

import styles, { markerCenterAnchor } from "./styles";

type CurrentLocationMarkerProps = {
  coordinate: LatLng;
};

export const CurrentLocationMarker = ({
  coordinate,
}: CurrentLocationMarkerProps) => (
  <Marker coordinate={coordinate} anchor={markerCenterAnchor} tappable={false}>
    <View style={styles.markerContainer} transparent>
      <View style={styles.currentLocationMarker}>
        <View style={styles.currentLocationMarkerHorizontal} />
        <View style={styles.currentLocationMarkerVertical} />
      </View>
    </View>
  </Marker>
);
