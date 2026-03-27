import { useMemo } from "react";
import { StyleSheet } from "react-native";

import { Polygon } from "react-native-maps";

import { MapViewWithInitialFit, Text, VView } from "components";
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

const sameCoordinate = (
  first: { latitude: number; longitude: number },
  second: { latitude: number; longitude: number },
) => first.latitude === second.latitude && first.longitude === second.longitude;

export const NodeGeoValuePreview = (props: NodeValuePreviewProps) => {
  const { value, valueFormatted } = props;

  const coordinates = useMemo(() => {
    const ring = value?.geometry?.coordinates?.[0];
    if (!Array.isArray(ring) || ring.length < 3) return [];

    const mappedCoordinates = ring
      .filter(
        (coordinate: unknown): coordinate is [number, number] =>
          Array.isArray(coordinate) && coordinate.length >= 2,
      )
      .map(([longitude, latitude]) => ({ latitude, longitude }));

    if (mappedCoordinates.length < 3) return [];

    const firstCoordinate = mappedCoordinates[0];
    const lastCoordinate = mappedCoordinates[mappedCoordinates.length - 1];
    if (
      firstCoordinate &&
      lastCoordinate &&
      sameCoordinate(firstCoordinate, lastCoordinate)
    ) {
      return mappedCoordinates.slice(0, -1);
    }

    return mappedCoordinates;
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
      <MapViewWithInitialFit
        style={styles.map}
        initialRegion={region}
        toolbarEnabled={false}
        fitToCoordinatesOnReady={coordinates}
        fitOnlyOnce={false}
      >
        <Polygon
          coordinates={coordinates}
          strokeColor={polygonStrokeColor}
          strokeWidth={2}
          fillColor={polygonFillColor}
        />
      </MapViewWithInitialFit>
    </VView>
  );
};
