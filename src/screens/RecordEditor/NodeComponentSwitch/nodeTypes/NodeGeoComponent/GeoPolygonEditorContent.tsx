import React, { useCallback, useMemo, useState } from "react";
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
import { GeoPolygonVerticesOverlay } from "./GeoPolygonVerticesOverlay";
import styles from "./styles";

const GEO_POLYGON_KEY = "geo_polygon_0";
const SELECTED_STROKE_COLOR = "#d32f2f";
const SELECTED_FILL_COLOR = "rgba(211, 47, 47, 0.25)";
const UNSELECTED_STROKE_COLOR = "#1976d2";
const UNSELECTED_FILL_COLOR = "rgba(25, 118, 210, 0.25)";

type UndoSnapshot = {
  draftCoordinates: LatLng[];
  polygons: MapPolygonExtendedProps[];
};

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
  const [undoStack, setUndoStack] = useState<UndoSnapshot[]>([]);
  const [isPolygonSelected, setIsPolygonSelected] = useState(false);

  const clonePolygons = useCallback(
    (sourcePolygons: MapPolygonExtendedProps[]) =>
      sourcePolygons.map((polygon) => ({
        ...polygon,
        coordinates: [...polygon.coordinates],
      })),
    [],
  );

  const restoreDraftCoordinates = useCallback(
    (coordinates: LatLng[]) => {
      const polygonEditor = polygonEditorRef.current;
      if (!polygonEditor) return;

      polygonEditor.resetAll();
      if (coordinates.length === 0) return;

      polygonEditor.startPolygon();
      for (const coordinate of coordinates) {
        polygonEditor.setCoordinate(coordinate);
      }
    },
    [polygonEditorRef],
  );

  const pushUndoSnapshot = useCallback(() => {
    setUndoStack((prev) => [
      ...prev,
      {
        draftCoordinates: [...draftCoordinates],
        polygons: clonePolygons(polygons),
      },
    ]);
  }, [clonePolygons, draftCoordinates, polygons]);

  const closeDraftPolygon = useCallback(() => {
    if (draftCoordinates.length < 3 || polygons.length > 0) return;

    pushUndoSnapshot();

    const newPolygonToEdit: MapPolygonExtendedProps = {
      key: GEO_POLYGON_KEY,
      coordinates: draftCoordinates,
      strokeWidth: newPolygon.strokeWidth ?? 2,
      strokeColor: newPolygon.strokeColor,
      fillColor: newPolygon.fillColor,
    };

    setPolygons([newPolygonToEdit]);
    setDraftCoordinates(newPolygonToEdit.coordinates);
    setIsPolygonSelected(true);
    setTimeout(() => {
      polygonEditorRef.current?.selectPolygonByIndex(0);
    }, 0);
  }, [
    draftCoordinates,
    newPolygon,
    polygonEditorRef,
    polygons.length,
    pushUndoSnapshot,
    setDraftCoordinates,
    setPolygons,
  ]);

  const onPolygonCreate = useCallback(
    (polygon: MapPolygonExtendedProps) => {
      setPolygons([polygon]);
      setDraftCoordinates(polygon.coordinates);
      setIsPolygonSelected(true);
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
    setUndoStack([]);
    setIsPolygonSelected(false);
  }, [setDraftCoordinates, setPolygons]);

  const onPolygonSelect = useCallback(() => {
    setIsPolygonSelected(true);
  }, []);

  const onPolygonUnselect = useCallback(() => {
    setIsPolygonSelected(false);
  }, []);

  const onMapPress = useCallback(
    (event: MapPressEvent) => {
      const coordinate = event.nativeEvent?.coordinate;
      if (!coordinate) return;

      if (polygons.length > 0) return;

      pushUndoSnapshot();

      setDraftCoordinates((prev) => [...prev, coordinate]);
    },
    [polygons.length, pushUndoSnapshot, setDraftCoordinates],
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

  const polygonVertices = useMemo(
    () => polygons[0]?.coordinates ?? [],
    [polygons],
  );

  const onMidpointDragEnd = useCallback(
    (insertAtIndex: number, coordinate: LatLng) => {
      const polygon = polygons[0];
      if (!polygon) return;

      pushUndoSnapshot();

      const clampedIndex = Math.max(
        1,
        Math.min(insertAtIndex, polygon.coordinates.length),
      );
      const before = polygon.coordinates[clampedIndex - 1];
      const after =
        polygon.coordinates[clampedIndex % polygon.coordinates.length];
      if (!before || !after) return;

      const updatedCoordinates = [...polygon.coordinates];
      updatedCoordinates.splice(clampedIndex, 0, coordinate);

      const updatedPolygon: MapPolygonExtendedProps = {
        ...polygon,
        coordinates: updatedCoordinates,
      };

      setPolygons([updatedPolygon]);
      setDraftCoordinates(updatedCoordinates);
      setIsPolygonSelected(true);
      polygonEditorRef.current?.selectPolygonByIndex(0);
    },
    [
      polygonEditorRef,
      polygons,
      pushUndoSnapshot,
      setDraftCoordinates,
      setPolygons,
    ],
  );

  const onUndoPress = useCallback(() => {
    const previousState = undoStack[undoStack.length - 1];
    if (!previousState) return;

    const restoredPolygons = clonePolygons(previousState.polygons);
    const restoredDraftCoordinates = [...previousState.draftCoordinates];

    setUndoStack((prev) => prev.slice(0, -1));
    setPolygons(restoredPolygons);
    setDraftCoordinates(restoredDraftCoordinates);

    if (restoredPolygons.length > 0) {
      setIsPolygonSelected(true);
      polygonEditorRef.current?.resetAll();
      setTimeout(() => {
        polygonEditorRef.current?.selectPolygonByIndex(0);
      }, 0);
      return;
    }

    setIsPolygonSelected(false);
    restoreDraftCoordinates(restoredDraftCoordinates);
  }, [
    clonePolygons,
    polygonEditorRef,
    restoreDraftCoordinates,
    setDraftCoordinates,
    setPolygons,
    undoStack,
  ]);

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
    setUndoStack([]);
    onSaveDrawing(polygonToSave);
  }, [onSaveDrawing, polygonToSave]);

  const onCancelPress = useCallback(() => {
    setUndoStack([]);
    onCancelDrawing();
  }, [onCancelDrawing]);

  const visibleCoordinates = polygons[0]?.coordinates ?? draftCoordinates;
  const hasValue = polygons.length > 0;
  const canSave = Boolean(polygonToSave) || hadValueWhenOpened;
  const strokeColor = isPolygonSelected
    ? SELECTED_STROKE_COLOR
    : UNSELECTED_STROKE_COLOR;
  const fillColor = isPolygonSelected
    ? SELECTED_FILL_COLOR
    : UNSELECTED_FILL_COLOR;
  const polygonsWithSelectionColor = useMemo(
    () =>
      polygons.map((polygon) => ({
        ...polygon,
        strokeColor,
        fillColor,
      })),
    [fillColor, polygons, strokeColor],
  );

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
          fillColor={fillColor}
          strokeColor={strokeColor}
          strokeWidth={newPolygon.strokeWidth}
          showPoints={!hasValue}
        />
        {isPolygonSelected && (
          <GeoPolygonVerticesOverlay
            coordinates={polygonVertices}
            strokeColor={strokeColor}
          />
        )}
        {isPolygonSelected && (
          <GeoPolygonMidpointsOverlay
            midpoints={polygonMidpoints}
            strokeColor={strokeColor}
            onMidpointDragEnd={onMidpointDragEnd}
          />
        )}
        <PolygonEditor
          ref={polygonEditorRef}
          newPolygon={{ ...newPolygon, strokeColor, fillColor }}
          polygons={polygonsWithSelectionColor}
          onPolygonCreate={onPolygonCreate}
          onPolygonChange={onPolygonChange}
          onPolygonRemove={onPolygonRemove}
          onPolygonSelect={onPolygonSelect}
          onPolygonUnselect={onPolygonUnselect}
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
        <IconButton
          disabled={undoStack.length === 0}
          icon="undo"
          onPress={onUndoPress}
          size={20}
        />
        {hasValue ? (
          <Button
            disabled={!canSave}
            icon="content-save"
            onPress={onSavePress}
            textKey="common:save"
          />
        ) : (
          <Button
            disabled={draftCoordinates.length < 3}
            icon="stop"
            onPress={closeDraftPolygon}
            textKey="common:stop"
          />
        )}
        <Button
          color="secondary"
          onPress={onCancelPress}
          textKey="common:cancel"
        />
      </HView>
    </VView>
  );
};
