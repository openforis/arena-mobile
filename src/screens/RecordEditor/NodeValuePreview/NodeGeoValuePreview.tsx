import { useMemo } from "react";
import { StyleSheet } from "react-native";

import { Polygon } from "react-native-maps";

import { MapView, Text, VView } from "components";
import { GeoUtils } from "utils";

import { NodeValuePreviewProps } from "./NodeValuePreviewPropTypes";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 220,
  },
  map: {
    flex: 1,
  },
});

const polygonFillColor = "rgba(21, 101, 192, 0.2)";
const polygonStrokeColor = "rgba(21, 101, 192, 0.95)";

export const NodeGeoValuePreview = (props: NodeValuePreviewProps) => {
  const { value, valueFormatted } = props;

  const coordinates = useMemo(() => {
    return GeoUtils.extractPolygonCoordinatesFromGeoJson(value) ?? [];
  }, [value]);

  const region = useMemo(() => {
    if (coordinates.length < 3) return GeoUtils.defaultMapRegion;

    return GeoUtils.computeRegionFromCoordinates(coordinates);
  }, [coordinates]);

  if (coordinates.length < 3) {
    return <Text>{valueFormatted ?? "---"}</Text>;
  }

  return (
    <VView style={styles.container}>
      <MapView
        fitToCoordinatesOnReady={coordinates}
        fitOnlyOnce={false}
        initialRegion={region}
        style={styles.map}
        toolbarEnabled={false}
      >
        <Polygon
          coordinates={coordinates}
          strokeColor={polygonStrokeColor}
          strokeWidth={2}
          fillColor={polygonFillColor}
        />
      </MapView>
    </VView>
  );
};
