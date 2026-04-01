import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  MapPolygonExtendedProps,
  PolygonEditor,
  PolygonEditorRef,
} from "@siposdani87/expo-maps-polygon-editor";
import MapView, { LatLng, MapPressEvent } from "react-native-maps";

import {
  Button,
  HView,
  IconButton,
  MapViewWithInitialFit,
  Text,
  VView,
} from "components";

import { GeoDraftOverlay } from "./GeoDraftOverlay";
import {
  GeoPolygonMidpoint,
  GeoPolygonMidpointsOverlay,
} from "./GeoPolygonMidpointsOverlay";
import styles from "./styles";

const GEO_POLYGON_KEY = "geo_polygon_0";

type GeoPolygonEditorContentProps = {
  draftCoordinates: LatLng[];
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  mapRef: React.RefObject<MapView | null>;
  newPolygon: MapPolygonExtendedProps;
  polygonEditorRef: React.RefObject<PolygonEditorRef | null>;
  polygons: MapPolygonExtendedProps[];
  setDraftCoordinates: React.Dispatch<React.SetStateAction<LatLng[]>>;
  setPolygons: React.Dispatch<React.SetStateAction<MapPolygonExtendedProps[]>>;
  onCancelDrawing: () => void;
  onCenterOnLocation: () => Promise<void>;
  onSaveDrawing: (polygon: MapPolygonExtendedProps | null) => void;
};

const determinePolygonToSave = ({
  polygons,
  draftCoordinates,
  newPolygon,
}: {
  polygons: MapPolygonExtendedProps[];
  draftCoordinates: LatLng[];
  newPolygon: MapPolygonExtendedProps;
}): MapPolygonExtendedProps | null => {
  const firstPolygon = polygons[0];
  if (firstPolygon) return firstPolygon;

  if (draftCoordinates.length >= 3) {
    return {
      key: GEO_POLYGON_KEY,
      coordinates: draftCoordinates,
      strokeWidth: newPolygon.strokeWidth ?? 2,
      strokeColor: newPolygon.strokeColor,
      fillColor: newPolygon.fillColor,
    };
  }

  return null;
};

export const GeoPolygonEditorContent = ({
  draftCoordinates,
  initialRegion,
  mapRef,
  newPolygon,
  polygonEditorRef,
  polygons,
  setDraftCoordinates,
  setPolygons,
  onCancelDrawing,
  onCenterOnLocation,
  onSaveDrawing,
}: GeoPolygonEditorContentProps) => {
  useEffect(() => {
    if (draftCoordinates.length !== 3 || polygons.length > 0) return;

    const newPolygonToEdit: MapPolygonExtendedProps = {
      key: GEO_POLYGON_KEY,
      coordinates: draftCoordinates,
      strokeWidth: newPolygon.strokeWidth ?? 2,
      strokeColor: newPolygon.strokeColor,
      fillColor: newPolygon.fillColor,
    };

    setPolygons([newPolygonToEdit]);
    polygonEditorRef.current?.selectPolygonByIndex(0);
  }, [
    draftCoordinates,
    newPolygon,
    polygonEditorRef,
    polygons.length,
    setPolygons,
  ]);

  const onPolygonCreate = useCallback(
    (polygon: MapPolygonExtendedProps) => {
      setPolygons([polygon]);
      setDraftCoordinates(polygon.coordinates);
    },
    [setDraftCoordinates, setPolygons],
  );

  const onPolygonChange = useCallback(
    (index: number, polygon: MapPolygonExtendedProps) => {
      setPolygons((prev) => {
        const updated = [...prev];
        updated[index] = polygon;
        return updated;
      });
      setDraftCoordinates(polygon.coordinates);
    },
    [setDraftCoordinates, setPolygons],
  );

  const onPolygonRemove = useCallback(() => {
    setPolygons([]);
    setDraftCoordinates([]);
  }, [setDraftCoordinates, setPolygons]);

  const onMapPress = useCallback(
    (event: MapPressEvent) => {
      const coordinate = event.nativeEvent?.coordinate;
      if (!coordinate) return;

      if (polygons.length > 0) return;

      setDraftCoordinates((prev) =>
        prev.length < 3 ? [...prev, coordinate] : prev,
      );

      polygonEditorRef.current?.setCoordinate(coordinate);
    },
    [polygonEditorRef, polygons.length, setDraftCoordinates],
  );

  const polygonMidpoints = useMemo<GeoPolygonMidpoint[]>(() => {
    const coordinates = polygons[0]?.coordinates ?? [];
    if (coordinates.length < 2) return [];

    return coordinates.map((current, index) => {
      const next = coordinates[(index + 1) % coordinates.length] ?? current;
      return {
        key: `polygon-midpoint-${index}`,
        coordinate: {
          latitude: (current.latitude + next.latitude) / 2,
          longitude: (current.longitude + next.longitude) / 2,
        },
        insertAtIndex: index + 1,
      };
    });
  }, [polygons]);

  const onMidpointPress = useCallback(
    (insertAtIndex: number) => {
      const polygon = polygons[0];
      if (!polygon) return;

      const clampedIndex = Math.max(
        1,
        Math.min(insertAtIndex, polygon.coordinates.length),
      );
      const before = polygon.coordinates[clampedIndex - 1];
      const after =
        polygon.coordinates[clampedIndex % polygon.coordinates.length];
      if (!before || !after) return;

      const midpoint: LatLng = {
        latitude: (before.latitude + after.latitude) / 2,
        longitude: (before.longitude + after.longitude) / 2,
      };

      const updatedCoordinates = [...polygon.coordinates];
      updatedCoordinates.splice(clampedIndex, 0, midpoint);

      const updatedPolygon: MapPolygonExtendedProps = {
        ...polygon,
        coordinates: updatedCoordinates,
      };

      setPolygons([updatedPolygon]);
      setDraftCoordinates(updatedCoordinates);
      polygonEditorRef.current?.selectPolygonByIndex(0);
    },
    [polygonEditorRef, polygons, setDraftCoordinates, setPolygons],
  );

  const polygonToSave = useMemo(
    () =>
      determinePolygonToSave({
        polygons,
        draftCoordinates,
        newPolygon,
      }),
    [draftCoordinates, newPolygon, polygons],
  );

  const [hadValueWhenOpened] = useState(() => polygons.length > 0);

  const onSavePress = useCallback(() => {
    onSaveDrawing(polygonToSave);
  }, [onSaveDrawing, polygonToSave]);

  const visibleCoordinates = polygons[0]?.coordinates ?? draftCoordinates;
  const hasValue = polygons.length > 0;
  const canSave = Boolean(polygonToSave) || hadValueWhenOpened;

  return (
    <VView style={styles.modalContent}>
      <MapViewWithInitialFit
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onPress={onMapPress}
        fitToCoordinatesOnReady={visibleCoordinates}
        fitOnlyOnce={true}
      >
        <GeoDraftOverlay
          coordinates={draftCoordinates}
          strokeColor={newPolygon.strokeColor}
          strokeWidth={newPolygon.strokeWidth}
          fillColor={newPolygon.fillColor}
          showPoints={!hasValue}
        />
        <GeoPolygonMidpointsOverlay
          midpoints={polygonMidpoints}
          strokeColor={newPolygon.strokeColor}
          onMidpointPress={onMidpointPress}
        />
        <PolygonEditor
          ref={polygonEditorRef}
          newPolygon={newPolygon}
          polygons={polygons}
          onPolygonCreate={onPolygonCreate}
          onPolygonChange={onPolygonChange}
          onPolygonRemove={onPolygonRemove}
          disabled={false}
        />
      </MapViewWithInitialFit>
      <Text
        style={styles.helperText}
        textKey={
          hasValue
            ? "dataEntry:geo.editPolygonInstructions"
            : "dataEntry:geo.tapToAddPoints"
        }
      />
      <HView style={styles.toolbar}>
        <IconButton
          icon="crosshairs-gps"
          onPress={onCenterOnLocation}
          size={24}
        />
        <Button
          disabled={!canSave}
          icon="content-save"
          onPress={onSavePress}
          textKey="common:save"
        />
        <Button
          color="secondary"
          onPress={onCancelDrawing}
          textKey="common:cancel"
        />
      </HView>
    </VView>
  );
};
