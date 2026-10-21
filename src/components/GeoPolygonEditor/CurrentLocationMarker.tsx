import React from "react";
import { View as RNView } from "react-native";
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
    <RNView collapsable={false} style={styles.markerContainer}>
      <View style={styles.currentLocationMarker}>
        <View style={styles.currentLocationMarkerHorizontal} />
        <View style={styles.currentLocationMarkerVertical} />
      </View>
    </RNView>
  </Marker>
);
