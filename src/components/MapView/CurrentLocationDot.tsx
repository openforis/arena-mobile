import React from "react";
import { StyleSheet } from "react-native";
import { Circle, Marker } from "react-native-maps";

import { LatLng } from "model";

import { View } from "../View";

const dotColorRgb = "66, 133, 244";
const dotColor = `rgb(${dotColorRgb})`;
const accuracyFillColor = `rgba(${dotColorRgb}, 0.15)`;
const accuracyStrokeColor = `rgba(${dotColorRgb}, 0.4)`;

type CurrentLocationDotProps = {
  accuracy?: number | null;
  coordinate: LatLng;
};

const styles = StyleSheet.create({
  container: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: "white",
    backgroundColor: dotColor,
  },
});

// Blue dot with a translucent ring showing the location accuracy, like in Google Maps
export const CurrentLocationDot = ({
  accuracy,
  coordinate,
}: CurrentLocationDotProps) => (
  <>
    {accuracy != null && accuracy > 0 && (
      <Circle
        center={coordinate}
        radius={accuracy}
        fillColor={accuracyFillColor}
        strokeColor={accuracyStrokeColor}
        strokeWidth={1}
      />
    )}
    <Marker
      anchor={{ x: 0.5, y: 0.5 }}
      coordinate={coordinate}
      tappable={false}
      zIndex={1}
    >
      <View style={styles.container}>
        <View style={styles.dot} />
      </View>
    </Marker>
  </>
);
