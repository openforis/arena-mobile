import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  MapPolygonExtendedProps,
  PolygonEditorRef,
  getRandomPolygonColors,
} from "@siposdani87/expo-maps-polygon-editor";
import MapView, { MapPressEvent } from "react-native-maps";

import { useLocationWatch } from "hooks";
import { LatLng } from "model";

import { GeoPolygonMidpoint } from "./GeoPolygonMidpointsOverlay";

const GEO_POLYGON_KEY = "geo_polygon_0";
const SELECTED_STROKE_COLOR = "#d32f2f";
const SELECTED_FILL_COLOR = "rgba(211, 47, 47, 0.25)";
const UNSELECTED_STROKE_COLOR = "#1976d2";
const UNSELECTED_FILL_COLOR = "rgba(25, 118, 210, 0.25)";

type UndoSnapshot = {
  draftCoordinates: LatLng[];
  polygons: MapPolygonExtendedProps[];
};

type LocalState = {
  draftCoordinates: LatLng[];
  polygons: MapPolygonExtendedProps[];
  undoStack: UndoSnapshot[];
  isPolygonSelected: boolean;
  selectedVertexIndex: number | null;
  currentLocationCoordinate: LatLng | null;
  isFollowingCurrentLocation: boolean;
};

type UseGeoPolygonEditorContentParams = {
  mapRef: React.RefObject<MapView | null>;
  initialPolygons: MapPolygonExtendedProps[];
  onCancelDrawing: () => void;
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

export const useGeoPolygonEditorContent = ({
  mapRef,
  initialPolygons,
  onCancelDrawing,
  onSaveDrawing,
}: UseGeoPolygonEditorContentParams) => {
  const polygonEditorRef = useRef<PolygonEditorRef>(null);
  const [localState, setLocalState] = useState<LocalState>(() => ({
    draftCoordinates: [],
    polygons: initialPolygons,
    undoStack: [],
    isPolygonSelected: false,
    selectedVertexIndex: null,
    currentLocationCoordinate: null,
    isFollowingCurrentLocation: false,
  }));

  const {
    draftCoordinates,
    polygons,
    undoStack,
    isPolygonSelected,
    selectedVertexIndex,
    currentLocationCoordinate,
    isFollowingCurrentLocation,
  } = localState;

  const isFollowingCurrentLocationRef = useRef(false);

  const newPolygon = useMemo<MapPolygonExtendedProps>(() => {
    const [strokeColor, fillColor] = getRandomPolygonColors();
    return {
      key: GEO_POLYGON_KEY,
      coordinates: [],
      strokeWidth: 2,
      strokeColor,
      fillColor,
    };
  }, []);

  const clonePolygons = useCallback(
    (sourcePolygons: MapPolygonExtendedProps[]) =>
      sourcePolygons.map((polygon) => ({
        ...polygon,
        coordinates: [...polygon.coordinates],
      })),
    [],
  );

  const restoreDraftCoordinates = useCallback((coordinates: LatLng[]) => {
    const polygonEditor = polygonEditorRef.current;
    if (!polygonEditor) return;

    polygonEditor.resetAll();
    if (coordinates.length === 0) return;

    polygonEditor.startPolygon();
    for (const coordinate of coordinates) {
      polygonEditor.setCoordinate(coordinate);
    }
  }, []);

  const pushUndoSnapshot = useCallback(() => {
    setLocalState((prev) => ({
      ...prev,
      undoStack: [
        ...prev.undoStack,
        {
          draftCoordinates: [...prev.draftCoordinates],
          polygons: clonePolygons(prev.polygons),
        },
      ],
    }));
  }, [clonePolygons]);

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

    setLocalState((prev) => ({
      ...prev,
      polygons: [newPolygonToEdit],
      draftCoordinates: newPolygonToEdit.coordinates,
      isPolygonSelected: true,
      selectedVertexIndex: null,
    }));
    setTimeout(() => {
      polygonEditorRef.current?.selectPolygonByIndex(0);
    }, 0);
  }, [draftCoordinates, newPolygon, polygons.length, pushUndoSnapshot]);

  const onPolygonCreate = useCallback((polygon: MapPolygonExtendedProps) => {
    setLocalState((prev) => ({
      ...prev,
      polygons: [polygon],
      draftCoordinates: polygon.coordinates,
      isPolygonSelected: true,
      selectedVertexIndex: null,
    }));
  }, []);

  const onPolygonChange = useCallback(
    (index: number, polygon: MapPolygonExtendedProps) => {
      setLocalState((prev) => {
        const updatedPolygons = [...prev.polygons];
        updatedPolygons[index] = polygon;

        let updatedSelectedVertexIndex = null;
        if (
          prev.selectedVertexIndex != null &&
          prev.selectedVertexIndex < polygon.coordinates.length
        ) {
          updatedSelectedVertexIndex = prev.selectedVertexIndex;
        }
        return {
          ...prev,
          polygons: updatedPolygons,
          draftCoordinates: polygon.coordinates,
          selectedVertexIndex: updatedSelectedVertexIndex,
        };
      });
    },
    [],
  );

  const onPolygonRemove = useCallback(() => {
    setLocalState((prev) => ({
      ...prev,
      polygons: [],
      draftCoordinates: [],
      undoStack: [],
      isPolygonSelected: false,
      selectedVertexIndex: null,
    }));
  }, []);

  const onPolygonSelect = useCallback(() => {
    setLocalState((prev) => ({ ...prev, isPolygonSelected: true }));
  }, []);

  const onPolygonUnselect = useCallback(() => {
    setLocalState((prev) => ({
      ...prev,
      isPolygonSelected: false,
      selectedVertexIndex: null,
    }));
  }, []);

  const onMapPress = useCallback(
    (event: MapPressEvent) => {
      const coordinate = event.nativeEvent?.coordinate;
      if (!coordinate) return;

      if (polygons.length > 0) return;

      setLocalState((prev) => ({
        ...prev,
        undoStack: [
          ...prev.undoStack,
          {
            draftCoordinates: [...prev.draftCoordinates],
            polygons: clonePolygons(prev.polygons),
          },
        ],
        selectedVertexIndex: null,
        draftCoordinates: [...prev.draftCoordinates, coordinate],
      }));
    },
    [clonePolygons, polygons.length],
  );

  const onLocationWatchCallback = useCallback(
    ({ location }: { location: LatLng | null }) => {
      if (!location) return;

      const { latitude, longitude } = location;

      const coordinate: LatLng = { latitude, longitude };

      setLocalState((prev) => ({
        ...prev,
        currentLocationCoordinate: coordinate,
      }));

      if (!isFollowingCurrentLocationRef.current) return;

      mapRef.current?.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    },
    [mapRef],
  );

  const { startLocationWatch, stopLocationWatch } = useLocationWatch({
    locationCallback: onLocationWatchCallback,
    stopOnAccuracyThreshold: false,
    stopOnTimeout: false,
  });

  const stopFollowingCurrentLocation = useCallback(() => {
    isFollowingCurrentLocationRef.current = false;
    stopLocationWatch();
    setLocalState((prev) => ({
      ...prev,
      isFollowingCurrentLocation: false,
      currentLocationCoordinate: null,
    }));
  }, [stopLocationWatch]);

  const onMapPanDrag = useCallback(() => {
    if (!isFollowingCurrentLocationRef.current) return;
    stopFollowingCurrentLocation();
  }, [stopFollowingCurrentLocation]);

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

      setLocalState((prev) => ({
        ...prev,
        polygons: [updatedPolygon],
        draftCoordinates: updatedCoordinates,
        isPolygonSelected: true,
        selectedVertexIndex: null,
      }));
      polygonEditorRef.current?.selectPolygonByIndex(0);
    },
    [polygons, pushUndoSnapshot],
  );

  const onVertexPress = useCallback((index: number) => {
    setLocalState((prev) => ({
      ...prev,
      selectedVertexIndex: index,
      isPolygonSelected: true,
    }));
  }, []);

  const onDeleteSelectedVertexPress = useCallback(() => {
    const polygon = polygons[0];
    if (!polygon || selectedVertexIndex == null) return;
    if (
      selectedVertexIndex < 0 ||
      selectedVertexIndex >= polygon.coordinates.length
    ) {
      return;
    }

    pushUndoSnapshot();

    const updatedCoordinates = polygon.coordinates.filter(
      (_, index) => index !== selectedVertexIndex,
    );

    if (updatedCoordinates.length >= 3) {
      const updatedPolygon: MapPolygonExtendedProps = {
        ...polygon,
        coordinates: updatedCoordinates,
      };
      setLocalState((prev) => ({
        ...prev,
        polygons: [updatedPolygon],
        draftCoordinates: updatedCoordinates,
        isPolygonSelected: true,
        selectedVertexIndex: null,
      }));
      setTimeout(() => {
        polygonEditorRef.current?.selectPolygonByIndex(0);
      }, 0);
      return;
    }

    setLocalState((prev) => ({
      ...prev,
      polygons: [],
      draftCoordinates: updatedCoordinates,
      isPolygonSelected: false,
      selectedVertexIndex: null,
    }));
    restoreDraftCoordinates(updatedCoordinates);
  }, [
    polygons,
    pushUndoSnapshot,
    restoreDraftCoordinates,
    selectedVertexIndex,
  ]);

  const onUndoPress = useCallback(() => {
    const previousState = undoStack[undoStack.length - 1];
    if (!previousState) return;

    const restoredPolygons = clonePolygons(previousState.polygons);
    const restoredDraftCoordinates = [...previousState.draftCoordinates];
    const restoredHasPolygons = restoredPolygons.length > 0;

    setLocalState((prev) => ({
      ...prev,
      undoStack: prev.undoStack.slice(0, -1),
      polygons: restoredPolygons,
      draftCoordinates: restoredDraftCoordinates,
      isPolygonSelected: restoredHasPolygons,
      selectedVertexIndex: null,
    }));

    if (restoredHasPolygons) {
      polygonEditorRef.current?.resetAll();
      setTimeout(() => {
        polygonEditorRef.current?.selectPolygonByIndex(0);
      }, 0);
      return;
    }

    restoreDraftCoordinates(restoredDraftCoordinates);
  }, [clonePolygons, restoreDraftCoordinates, undoStack]);

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
    stopFollowingCurrentLocation();
    setLocalState((prev) => ({ ...prev, undoStack: [] }));
    onSaveDrawing(polygonToSave);
  }, [onSaveDrawing, polygonToSave, stopFollowingCurrentLocation]);

  const onCenterOnLocation = useCallback(async () => {
    if (isFollowingCurrentLocationRef.current) {
      stopFollowingCurrentLocation();
      return;
    }

    isFollowingCurrentLocationRef.current = true;
    setLocalState((prev) => ({
      ...prev,
      isFollowingCurrentLocation: true,
    }));

    await startLocationWatch();
  }, [startLocationWatch, stopFollowingCurrentLocation]);

  const onCancelPress = useCallback(() => {
    stopFollowingCurrentLocation();
    setLocalState((prev) => ({ ...prev, undoStack: [] }));
    onCancelDrawing();
  }, [onCancelDrawing, stopFollowingCurrentLocation]);

  useEffect(
    () => () => {
      isFollowingCurrentLocationRef.current = false;
      stopLocationWatch();
    },
    [stopLocationWatch],
  );

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

  const helperTextKey = useMemo(() => {
    if (!hasValue) {
      return "dataEntry:geo.tapToAddPoints";
    }
    if (isPolygonSelected) {
      return "dataEntry:geo.editPolygonInstructions";
    }
    return "dataEntry:geo.selectPolygonInstruction";
  }, [hasValue, isPolygonSelected]);

  return {
    canSave,
    closeDraftPolygon,
    draftCoordinates,
    fillColor,
    hasValue,
    helperTextKey,
    isPolygonSelected,
    newPolygon,
    onCancelPress,
    onCenterOnLocation,
    onDeleteSelectedVertexPress,
    onMapPress,
    onMapPanDrag,
    onMidpointDragEnd,
    onPolygonChange,
    onPolygonCreate,
    onPolygonRemove,
    onPolygonSelect,
    onPolygonUnselect,
    onSavePress,
    onUndoPress,
    onVertexPress,
    polygonEditorRef,
    polygonMidpoints,
    polygonsWithSelectionColor,
    polygonVertices,
    selectedVertexIndex,
    currentLocationCoordinate,
    isFollowingCurrentLocation,
    shouldShowDeleteSelectedPoint:
      hasValue && isPolygonSelected && selectedVertexIndex != null,
    strokeColor,
    undoStack,
    visibleCoordinates,
  };
};
