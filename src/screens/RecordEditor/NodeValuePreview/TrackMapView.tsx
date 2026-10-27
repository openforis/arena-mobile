import { useCallback, useMemo, useRef, useState } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import RNMapView, { Polyline, UserLocationChangeEvent } from "react-native-maps";

import { IconButton, MapView, VView } from "components";
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
  followButton: {
    position: "absolute",
    top: 8,
    left: 8,
  },
});

const trackStrokeColor = "rgba(229, 57, 53, 0.95)";
const FOLLOW_ANIMATION_DURATION = 500;

type Props = {
  segments: TrackSegment[];
  // when true, the map is fitted to the track only when it's ready (e.g. track being recorded)
  fitOnlyOnce?: boolean;
  // when true, the map is centered on the current position until the user moves it
  followUserLocation?: boolean;
  // false in scrollable forms: the map must not catch the scroll gestures
  interactive?: boolean;
  showsUserLocation?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const TrackMapView = (props: Props) => {
  const {
    segments,
    fitOnlyOnce = false,
    followUserLocation = false,
    interactive = true,
    showsUserLocation,
    style,
  } = props;

  const mapRef = useRef<RNMapView | null>(null);
  const [following, setFollowing] = useState(true);

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

  const followActive = followUserLocation && following;

  const onUserLocationChange = useCallback(
    (event: UserLocationChangeEvent) => {
      const coordinate = event.nativeEvent.coordinate;
      if (!followActive || !coordinate) return;
      const { latitude, longitude } = coordinate;
      void mapRef.current?.animateCamera(
        { center: { latitude, longitude } },
        { duration: FOLLOW_ANIMATION_DURATION },
      );
    },
    [followActive],
  );
  // moving the map stops following the position
  const onPanDrag = useCallback(() => setFollowing(false), []);
  const startFollowing = useCallback(() => setFollowing(true), []);

  return (
    <VView
      pointerEvents={interactive ? undefined : "none"}
      style={[styles.container, style]}
    >
      <MapView
        ref={mapRef}
        fitToCoordinatesOnReady={coordinates.length > 0 ? coordinates : undefined}
        fitOnlyOnce={fitOnlyOnce}
        initialRegion={region}
        onPanDrag={followUserLocation ? onPanDrag : undefined}
        onUserLocationChange={
          followUserLocation ? onUserLocationChange : undefined
        }
        // layer buttons can't be pressed in a non-interactive map
        showMapTypeSelector={interactive}
        showsUserLocation={showsUserLocation}
        style={styles.map}
        toolbarEnabled={false}
      >
        {lines.map((line, index) => (
          <Polyline
            key={index}
            coordinates={line}
            strokeColor={trackStrokeColor}
            strokeWidth={4}
          />
        ))}
      </MapView>
      {followUserLocation && !following && (
        <IconButton
          icon="crosshairs-gps"
          mode="contained"
          onPress={startFollowing}
          style={styles.followButton}
        />
      )}
    </VView>
  );
};
