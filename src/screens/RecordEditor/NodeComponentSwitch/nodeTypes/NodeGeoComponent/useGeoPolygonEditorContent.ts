import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  MapPolygonExtendedProps,
  getRandomPolygonColors,
} from "./polygonEditorUtils";
import MapView, { MapPressEvent } from "react-native-maps";

import { useLocationWatch } from "hooks";
import { LatLng } from "model";
import { GeoUtils } from "utils";

import { GeoPolygonMidpoint } from "./GeoPolygonMidpointsOverlay";

const GEO_POLYGON_KEY = "geo_polygon_0";
const VERTEX_SNAP_EPSILON = 0.00002;
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
  draggingVertexIndex: number | null;
  draggingVertexCoordinate: LatLng | null;
  draggingMidpointInsertAtIndex: number | null;
  draggingMidpointCoordinate: LatLng | null;
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

const getSnappedVertexCoordinate = ({
  coordinates,
  movingVertexIndex,
  draggedCoordinate,
}: {
  coordinates: LatLng[];
  movingVertexIndex: number;
  draggedCoordinate: LatLng;
}): LatLng => {
  for (let index = 0; index < coordinates.length; index += 1) {
    if (index === movingVertexIndex) continue;

    const candidate = coordinates[index];
    if (!candidate) continue;

    if (
      GeoUtils.isSameCoordinate(
        candidate,
        draggedCoordinate,
        VERTEX_SNAP_EPSILON,
      )
    ) {
      return candidate;
    }
  }

  return draggedCoordinate;
};

const getCoordinatesWithDraggedVertex = ({
  coordinates,
  draggingVertexIndex,
  draggingVertexCoordinate,
}: {
  coordinates: LatLng[];
  draggingVertexIndex: number | null;
  draggingVertexCoordinate: LatLng | null;
}): LatLng[] => {
  if (draggingVertexIndex == null || !draggingVertexCoordinate) {
    return coordinates;
  }
  if (draggingVertexIndex < 0 || draggingVertexIndex >= coordinates.length) {
    return coordinates;
  }

  const snappedCoordinate = getSnappedVertexCoordinate({
    coordinates,
    movingVertexIndex: draggingVertexIndex,
    draggedCoordinate: draggingVertexCoordinate,
  });

  const updatedCoordinates = [...coordinates];
  updatedCoordinates[draggingVertexIndex] = snappedCoordinate;
  return updatedCoordinates;
};

const getCoordinatesWithDraggedMidpoint = ({
  coordinates,
  draggingMidpointInsertAtIndex,
  draggingMidpointCoordinate,
}: {
  coordinates: LatLng[];
  draggingMidpointInsertAtIndex: number | null;
  draggingMidpointCoordinate: LatLng | null;
}): LatLng[] => {
  if (draggingMidpointInsertAtIndex == null || !draggingMidpointCoordinate) {
    return coordinates;
  }

  const clampedIndex = Math.max(
    1,
    Math.min(draggingMidpointInsertAtIndex, coordinates.length),
  );
  const updatedCoordinates = [...coordinates];
  updatedCoordinates.splice(clampedIndex, 0, draggingMidpointCoordinate);
  return updatedCoordinates;
};

export const useGeoPolygonEditorContent = ({
  mapRef,
  initialPolygons,
  onCancelDrawing,
  onSaveDrawing,
}: UseGeoPolygonEditorContentParams) => {
  const [localState, setLocalState] = useState<LocalState>(() => ({
    draftCoordinates: [],
    polygons: initialPolygons,
    undoStack: [],
    isPolygonSelected: false,
    selectedVertexIndex: null,
    draggingVertexIndex: null,
    draggingVertexCoordinate: null,
    draggingMidpointInsertAtIndex: null,
    draggingMidpointCoordinate: null,
    currentLocationCoordinate: null,
    isFollowingCurrentLocation: false,
  }));

  const {
    draftCoordinates,
    polygons,
    undoStack,
    isPolygonSelected,
    selectedVertexIndex,
    draggingVertexIndex,
    draggingVertexCoordinate,
    draggingMidpointInsertAtIndex,
    draggingMidpointCoordinate,
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
  }, [draftCoordinates, newPolygon, polygons.length, pushUndoSnapshot]);

  const onPolygonPress = useCallback(() => {
    setLocalState((prev) => ({ ...prev, isPolygonSelected: true }));
  }, []);

  const onPolygonUnselect = useCallback(() => {
    setLocalState((prev) => ({
      ...prev,
      isPolygonSelected: false,
      selectedVertexIndex: null,
      draggingVertexIndex: null,
      draggingVertexCoordinate: null,
      draggingMidpointInsertAtIndex: null,
      draggingMidpointCoordinate: null,
    }));
  }, []);

  const addCoordinateToDraft = useCallback(
    (
      coordinate: LatLng,
      options?: {
        skipIfAlreadyInserted?: boolean;
      },
    ) => {
      setLocalState((prev) => {
        if (prev.polygons.length > 0) return prev;

        const skipIfAlreadyInserted = options?.skipIfAlreadyInserted ?? true;

        if (
          skipIfAlreadyInserted &&
          GeoUtils.hasCoordinate(prev.draftCoordinates, coordinate)
        ) {
          return prev;
        }

        return {
          ...prev,
          undoStack: [
            ...prev.undoStack,
            {
              draftCoordinates: [...prev.draftCoordinates],
              polygons: clonePolygons(prev.polygons),
            },
          ],
          selectedVertexIndex: null,
          draggingVertexIndex: null,
          draggingVertexCoordinate: null,
          draggingMidpointInsertAtIndex: null,
          draggingMidpointCoordinate: null,
          draftCoordinates: [...prev.draftCoordinates, coordinate],
        };
      });
    },
    [clonePolygons],
  );

  const onMapPress = useCallback(
    (event: MapPressEvent) => {
      if (polygons.length > 0) {
        onPolygonUnselect();
        return;
      }

      const coordinate = event.nativeEvent?.coordinate;
      if (!coordinate) return;

      addCoordinateToDraft(coordinate);
    },
    [addCoordinateToDraft, onPolygonUnselect, polygons.length],
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

  const onAddCurrentLocationPointPress = useCallback(() => {
    if (!currentLocationCoordinate) return;

    addCoordinateToDraft(currentLocationCoordinate, {
      skipIfAlreadyInserted: true,
    });
  }, [addCoordinateToDraft, currentLocationCoordinate]);

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
        draggingVertexIndex: null,
        draggingVertexCoordinate: null,
        draggingMidpointInsertAtIndex: null,
        draggingMidpointCoordinate: null,
      }));
    },
    [polygons, pushUndoSnapshot],
  );

  const onMidpointDragStart = useCallback((insertAtIndex: number) => {
    setLocalState((prev) => ({
      ...prev,
      selectedVertexIndex: null,
      draggingVertexIndex: null,
      draggingVertexCoordinate: null,
      draggingMidpointInsertAtIndex: insertAtIndex,
      draggingMidpointCoordinate: null,
      isPolygonSelected: true,
    }));
  }, []);

  const onMidpointDrag = useCallback(
    (insertAtIndex: number, coordinate: LatLng) => {
      setLocalState((prev) => ({
        ...prev,
        selectedVertexIndex: null,
        draggingVertexIndex: null,
        draggingVertexCoordinate: null,
        draggingMidpointInsertAtIndex: insertAtIndex,
        draggingMidpointCoordinate: coordinate,
        isPolygonSelected: true,
      }));
    },
    [],
  );

  const onVertexPress = useCallback((index: number) => {
    setLocalState((prev) => ({
      ...prev,
      selectedVertexIndex: index,
      draggingMidpointInsertAtIndex: null,
      draggingMidpointCoordinate: null,
      isPolygonSelected: true,
    }));
  }, []);

  const onVertexDragStart = useCallback((index: number) => {
    setLocalState((prev) => ({
      ...prev,
      selectedVertexIndex: index,
      draggingVertexIndex: index,
      draggingVertexCoordinate: null,
      draggingMidpointInsertAtIndex: null,
      draggingMidpointCoordinate: null,
      isPolygonSelected: true,
    }));
  }, []);

  const onVertexDrag = useCallback((index: number, coordinate: LatLng) => {
    setLocalState((prev) => ({
      ...prev,
      selectedVertexIndex: index,
      draggingVertexIndex: index,
      draggingVertexCoordinate: coordinate,
      draggingMidpointInsertAtIndex: null,
      draggingMidpointCoordinate: null,
      isPolygonSelected: true,
    }));
  }, []);

  const onVertexDragEnd = useCallback(
    (index: number, coordinate: LatLng) => {
      const polygon = polygons[0];
      if (!polygon) return;
      if (index < 0 || index >= polygon.coordinates.length) return;

      pushUndoSnapshot();

      const snappedCoordinate = getSnappedVertexCoordinate({
        coordinates: polygon.coordinates,
        movingVertexIndex: index,
        draggedCoordinate: coordinate,
      });

      const updatedCoordinates = [...polygon.coordinates];
      updatedCoordinates[index] = snappedCoordinate;

      const updatedPolygon: MapPolygonExtendedProps = {
        ...polygon,
        coordinates: updatedCoordinates,
      };

      setLocalState((prev) => ({
        ...prev,
        polygons: [updatedPolygon],
        draftCoordinates: updatedCoordinates,
        isPolygonSelected: true,
        selectedVertexIndex: index,
        draggingVertexIndex: null,
        draggingVertexCoordinate: null,
      }));
    },
    [polygons, pushUndoSnapshot],
  );

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
        draggingMidpointInsertAtIndex: null,
        draggingMidpointCoordinate: null,
      }));
      return;
    }

    setLocalState((prev) => ({
      ...prev,
      polygons: [],
      draftCoordinates: updatedCoordinates,
      isPolygonSelected: false,
      selectedVertexIndex: null,
      draggingMidpointInsertAtIndex: null,
      draggingMidpointCoordinate: null,
    }));
  }, [polygons, pushUndoSnapshot, selectedVertexIndex]);

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
      draggingVertexIndex: null,
      draggingVertexCoordinate: null,
      draggingMidpointInsertAtIndex: null,
      draggingMidpointCoordinate: null,
    }));
  }, [clonePolygons, undoStack]);

  const activePolygonCoordinates = useMemo(
    () => polygons[0]?.coordinates ?? [],
    [polygons],
  );

  const previewPolygonCoordinatesWithDraggedVertex = useMemo(
    () =>
      getCoordinatesWithDraggedVertex({
        coordinates: activePolygonCoordinates,
        draggingVertexIndex,
        draggingVertexCoordinate,
      }),
    [activePolygonCoordinates, draggingVertexCoordinate, draggingVertexIndex],
  );

  const previewPolygonCoordinates = useMemo(
    () =>
      getCoordinatesWithDraggedMidpoint({
        coordinates: previewPolygonCoordinatesWithDraggedVertex,
        draggingMidpointInsertAtIndex,
        draggingMidpointCoordinate,
      }),
    [
      draggingMidpointCoordinate,
      draggingMidpointInsertAtIndex,
      previewPolygonCoordinatesWithDraggedVertex,
    ],
  );

  const previewDraftCoordinates = useMemo(
    () => (polygons.length > 0 ? previewPolygonCoordinates : draftCoordinates),
    [draftCoordinates, polygons.length, previewPolygonCoordinates],
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
  const canAddCurrentLocationPoint =
    isFollowingCurrentLocation &&
    Boolean(currentLocationCoordinate) &&
    !hasValue;
  const strokeColor = isPolygonSelected
    ? SELECTED_STROKE_COLOR
    : UNSELECTED_STROKE_COLOR;
  const fillColor = isPolygonSelected
    ? SELECTED_FILL_COLOR
    : UNSELECTED_FILL_COLOR;
  const selectedPolygonCoordinates = activePolygonCoordinates;
  const shouldShowDeleteSelectedPoint =
    Boolean(selectedPolygonCoordinates) &&
    isPolygonSelected &&
    selectedVertexIndex != null;

  const helperTextKey = useMemo(() => {
    if (canAddCurrentLocationPoint) {
      return "dataEntry:geo.addCurrentLocationPointInstructions";
    }
    if (!hasValue) {
      return "dataEntry:geo.tapToAddPoints";
    }
    if (isPolygonSelected) {
      return "dataEntry:geo.editPolygonInstructions";
    }
    return "dataEntry:geo.selectPolygonInstruction";
  }, [canAddCurrentLocationPoint, hasValue, isPolygonSelected]);

  return {
    canSave,
    closeDraftPolygon,
    draftCoordinates: previewDraftCoordinates,
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
    onAddCurrentLocationPointPress,
    onMidpointDragStart,
    onMidpointDrag,
    onMidpointDragEnd,
    onPolygonPress,
    onPolygonUnselect,
    onSavePress,
    onUndoPress,
    onVertexPress,
    onVertexDragStart,
    onVertexDrag,
    onVertexDragEnd,
    polygonMidpoints,
    polygonVertices: activePolygonCoordinates,
    draggingVertexIndex,
    draggingMidpointInsertAtIndex,
    selectedVertexIndex,
    currentLocationCoordinate,
    isFollowingCurrentLocation,
    canAddCurrentLocationPoint,
    shouldShowDeleteSelectedPoint,
    strokeColor,
    undoStack,
    visibleCoordinates,
  };
};
