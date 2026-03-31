import { useCallback, useMemo } from "react";

import {
  MapPolygonExtendedProps,
  PolygonEditorRef,
} from "@siposdani87/expo-maps-polygon-editor";
import * as Location from "expo-location";
import MapView, {
  LatLng,
  MapPressEvent,
  MarkerPressEvent,
} from "react-native-maps";

import { UUIDs } from "@openforis/arena-core";

import { GeoUtils } from "utils";
import { Permissions } from "utils/Permissions";

import { PolygonMidpoint } from "./types";
import { LocalState } from "./useNodeGeoComponent";

const GEO_POLYGON_KEY = "geo_polygon_0";

export interface UseNodeGeoEditorContentProps {
  draftCoordinates: LatLng[];
  mapRef: React.RefObject<MapView | null>;
  newPolygon: MapPolygonExtendedProps;
  polygonEditorRef: React.RefObject<PolygonEditorRef | null>;
  polygons: MapPolygonExtendedProps[];
  setLocalState: React.Dispatch<React.SetStateAction<LocalState>>;
  onSavePolygon: (polygon: MapPolygonExtendedProps | null) => void;
}

const determinePolygonsToSave = ({
  polygons,
  draftCoordinates,
  newPolygon,
}: {
  polygons: MapPolygonExtendedProps[];
  draftCoordinates: LatLng[];
  newPolygon: MapPolygonExtendedProps;
}) => {
  const firstPolygon = polygons[0];
  if (firstPolygon) {
    return firstPolygon;
  }
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

export const useNodeGeoEditorContent = ({
  draftCoordinates,
  mapRef,
  newPolygon,
  polygonEditorRef,
  polygons,
  setLocalState,
  onSavePolygon,
}: UseNodeGeoEditorContentProps) => {
  const hasValue = polygons.length > 0;

  const onCenterOnLocation = useCallback(async () => {
    if (!(await Permissions.requestLocationForegroundPermission())) return;

    const location = await Location.getCurrentPositionAsync();
    const { latitude, longitude } = location.coords;
    mapRef.current?.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  }, [mapRef]);

  const onSaveCurrentPolygon = useCallback(() => {
    const polygonToSave = determinePolygonsToSave({
      polygons,
      draftCoordinates,
      newPolygon,
    });

    if (!polygonToSave) return;

    setLocalState((prev) => ({
      ...prev,
      polygons: [polygonToSave],
      draftCoordinates: [],
      editable: false,
      isPolygonSelected: false,
    }));
    onSavePolygon(polygonToSave);
  }, [draftCoordinates, newPolygon, onSavePolygon, polygons, setLocalState]);

  const onPolygonCreate = useCallback(
    (polygon: MapPolygonExtendedProps) => {
      setLocalState((prev) => ({
        ...prev,
        polygons: [polygon],
        draftCoordinates: [],
        editable: true,
      }));
    },
    [setLocalState],
  );

  const onPolygonChange = useCallback(
    (index: number, polygon: MapPolygonExtendedProps) => {
      setLocalState((prev) => {
        const updated = [...prev.polygons];
        updated[index] = polygon;
        return { ...prev, polygons: updated };
      });
    },
    [setLocalState],
  );

  const onPolygonRemove = useCallback(
    (_index: number) => {
      setLocalState((prev) => ({
        ...prev,
        polygons: [],
        draftCoordinates: [],
        isPolygonSelected: false,
      }));
    },
    [setLocalState],
  );

  const onPolygonSelect = useCallback(() => {
    setLocalState((prev) => ({ ...prev, isPolygonSelected: true }));
  }, [setLocalState]);

  const onPolygonUnselect = useCallback(() => {
    setLocalState((prev) => ({ ...prev, isPolygonSelected: false }));
  }, [setLocalState]);

  const onUndoLastCoordinate = useCallback(() => {
    const newDraftCoordinates = draftCoordinates.slice(0, -1);

    // If we undo below 3 draft coordinates, clear the polygon being edited
    const shouldClearPolygons =
      newDraftCoordinates.length < 3 && polygons.length > 0;

    setLocalState((prev) => ({
      ...prev,
      draftCoordinates: newDraftCoordinates,
      ...(shouldClearPolygons && { polygons: [] }),
    }));

    const polygonEditor = polygonEditorRef.current;
    if (!polygonEditor) return;
    polygonEditor.resetAll();

    if (newDraftCoordinates.length > 0) {
      polygonEditor.startPolygon();
      for (const coord of newDraftCoordinates) {
        polygonEditor.setCoordinate(coord);
      }
    }
  }, [draftCoordinates, polygons.length, polygonEditorRef, setLocalState]);

  const onMapPress = useCallback(
    (event: MapPressEvent) => {
      const { coordinate } = event.nativeEvent ?? {};
      if (!coordinate) return;

      if (polygons.length === 0) {
        // Allow creating a draft polygon before PolygonEditor has an active polygon.
        setLocalState((prev) => ({
          ...prev,
          draftCoordinates: [...prev.draftCoordinates, coordinate],
        }));
      }

      polygonEditorRef.current?.setCoordinate(coordinate);
    },
    [polygonEditorRef, polygons.length, setLocalState],
  );

  const polygonMidpoints = useMemo<PolygonMidpoint[]>(() => {
    const coordinates = polygons[0]?.coordinates ?? [];
    if (coordinates.length < 2) return [];

    return coordinates.map((current, index) => {
      const next = coordinates[(index + 1) % coordinates.length] ?? current;
      return {
        uuid: UUIDs.v4(),
        coordinate: GeoUtils.computeMidpointCoordinate(current, next),
        insertAtIndex: index + 1,
      };
    });
  }, [polygons]);

  const onPolygonMidpointPress = useCallback(
    (insertAtIndex: number) => (event: MarkerPressEvent) => {
      event.stopPropagation();

      setLocalState((prev) => {
        const polygon = prev.polygons[0];
        if (!polygon) return prev;

        const clampedIndex = Math.max(
          1,
          Math.min(insertAtIndex, polygon.coordinates.length),
        );
        const before = polygon.coordinates[clampedIndex - 1];
        const after =
          polygon.coordinates[clampedIndex % polygon.coordinates.length];
        if (!before || !after) return prev;

        const midpoint = GeoUtils.computeMidpointCoordinate(before, after);
        const updatedCoordinates = [...polygon.coordinates];
        updatedCoordinates.splice(clampedIndex, 0, midpoint);

        return {
          ...prev,
          polygons: [
            {
              ...polygon,
              coordinates: updatedCoordinates,
            },
          ],
        };
      });
    },
    [setLocalState],
  );

  return {
    hasValue,
    onMapPress,
    onPolygonMidpointPress,
    onPolygonSelect,
    onPolygonUnselect,
    polygonMidpoints,
    onCenterOnLocation,
    onSaveCurrentPolygon,
    onUndoLastCoordinate,
    onPolygonCreate,
    onPolygonChange,
    onPolygonRemove,
  };
};
