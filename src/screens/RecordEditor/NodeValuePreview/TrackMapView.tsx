import { useMemo } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { Polyline } from "react-native-maps";

import { MapView, VView } from "components";
import { TrackSegment } from "model";
import { GeoUtils } from "utils";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 220,
  },
  map: {
    flex: 1,
  },
});

const trackStrokeColor = "rgba(229, 57, 53, 0.95)";

type Props = {
  segments: TrackSegment[];
  // when true, the map is fitted to the track only when it's ready (e.g. track being recorded)
  fitOnlyOnce?: boolean;
  // false in scrollable forms: the map must not catch the scroll gestures
  interactive?: boolean;
  showsUserLocation?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const TrackMapView = (props: Props) => {
  const {
    segments,
    fitOnlyOnce = false,
    interactive = true,
    showsUserLocation,
    style,
  } = props;

  const lines = useMemo(
    () =>
      segments
        .filter((segment) => segment.length > 0)
        .map((segment) =>
          segment.map(({ latitude, longitude }) => ({ latitude, longitude })),
        ),
    [segments],
  );
  const coordinates = useMemo(() => lines.flat(), [lines]);

  const region = useMemo(
    () => GeoUtils.computeRegionFromCoordinates(coordinates),
    // the initial region is used only when the map is mounted
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <VView
      pointerEvents={interactive ? undefined : "none"}
      style={[styles.container, style]}
    >
      <MapView
        fitToCoordinatesOnReady={coordinates.length > 0 ? coordinates : undefined}
        fitOnlyOnce={fitOnlyOnce}
        initialRegion={region}
        showsUserLocation={showsUserLocation}
        style={styles.map}
        toolbarEnabled={false}
      >
        {lines.map((line, index) => (
          <Polyline
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            coordinates={line}
            strokeColor={trackStrokeColor}
            strokeWidth={4}
          />
        ))}
      </MapView>
    </VView>
  );
};
