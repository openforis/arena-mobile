import React, { useCallback, useEffect, useMemo, useRef } from "react";
import RNMapView, { Marker, MarkerDragStartEndEvent } from "react-native-maps";
import { useRoute } from "@react-navigation/native";

import { Button, IconButton, MapView, Text, VView } from "components";
import { CurrentLocationMarker } from "components/GeoPolygonEditor/CurrentLocationMarker";
import { useLocationWatch } from "hooks";
import { LatLng } from "model";
import { DataEntryActions, useAppDispatch } from "state";
import { log } from "utils";

import styles from "./styles";

export type LocationMapViewerParams = {
  latitude: number;
  longitude: number;
  nodeUuid?: string; // when set, the marker can be dragged to update the coordinate
};

export const LocationMapViewerScreen = () => {
  log.debug("rendering LocationMapViewerScreen");

  const route = useRoute();
  const params = route.params as LocationMapViewerParams;
  const { nodeUuid } = params;
  const dispatch = useAppDispatch();
  const [savedPosition, setSavedPosition] = React.useState<LatLng>({
    latitude: Number(params.latitude),
    longitude: Number(params.longitude),
  });
  const [markerPosition, setMarkerPosition] =
    React.useState<LatLng>(savedPosition);

  const mapRef = useRef<RNMapView | null>(null);
  const [currentLocation, setCurrentLocation] = React.useState<LatLng | null>(
    null,
  );

  const target = markerPosition;

  const initialRegion = useMemo(
    () => ({ ...savedPosition, latitudeDelta: 0.005, longitudeDelta: 0.005 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const relocated =
    markerPosition.latitude !== savedPosition.latitude ||
    markerPosition.longitude !== savedPosition.longitude;

  const onMarkerDragEnd = useCallback((event: MarkerDragStartEndEvent) => {
    const { latitude: lat, longitude: lng } = event.nativeEvent.coordinate;
    setMarkerPosition({ latitude: lat, longitude: lng });
  }, []);

  const onSavePress = useCallback(() => {
    if (!nodeUuid) return;
    dispatch(
      DataEntryActions.updateCoordinateValueFromLatLong({
        nodeUuid,
        ...markerPosition,
      }),
    );
    setSavedPosition(markerPosition);
  }, [dispatch, markerPosition, nodeUuid]);

  const onLocation = useCallback(
    ({ location }: { location: LatLng | null }) => {
      if (!location) return;
      setCurrentLocation({
        latitude: location.latitude,
        longitude: location.longitude,
      });
    },
    [],
  );

  const { startLocationWatch, stopLocationWatch } = useLocationWatch({
    locationCallback: onLocation,
    stopOnAccuracyThreshold: false,
    stopOnTimeout: false,
  });

  useEffect(() => {
    void startLocationWatch();
    return () => stopLocationWatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFitPress = useCallback(() => {
    const coordinates = currentLocation ? [target, currentLocation] : [target];
    if (coordinates.length === 1) {
      mapRef.current?.animateToRegion(initialRegion);
      return;
    }
    mapRef.current?.fitToCoordinates(coordinates, {
      edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
      animated: true,
    });
  }, [currentLocation, initialRegion, target]);

  return (
    <VView style={styles.container}>
      <MapView
        ref={mapRef}
        initialRegion={initialRegion}
        style={styles.map}
        toolbarEnabled={false}
      >
        <Marker
          coordinate={target}
          draggable={!!nodeUuid}
          onDragEnd={onMarkerDragEnd}
        />
        {currentLocation && (
          <CurrentLocationMarker coordinate={currentLocation} />
        )}
      </MapView>
      {nodeUuid && (
        <VView style={styles.bottomPanel}>
          {relocated ? (
            <Button
              icon="content-save"
              onPress={onSavePress}
              textKey="dataEntry:coordinate.saveNewPosition"
            />
          ) : (
            <Text
              style={styles.hint}
              textKey="dataEntry:coordinate.longPressMarkerToMove"
            />
          )}
        </VView>
      )}
      <IconButton
        icon="crosshairs-gps"
        onPress={onFitPress}
        style={styles.fitButton}
      />
    </VView>
  );
};
