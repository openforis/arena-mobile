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

import { DataEntryActions, useAppDispatch, useConfirm } from "state";
import { GeoUtils } from "utils";
import { Permissions } from "utils/Permissions";

import { NodeGeoToolbar } from "./NodeGeoToolbar";
import { LocalState } from "./useNodeGeoComponent";

const GEO_POLYGON_KEY = "geo_polygon_0";

interface PolygonMidpoint {
  coordinate: LatLng;
  insertAtIndex: number;
}

export interface UseNodeGeoEditorContentProps {
  nodeUuid: string | undefined;
  draftCoordinates: LatLng[];
  editable: boolean;
  mapRef: React.RefObject<MapView | null>;
  newPolygon: MapPolygonExtendedProps;
  polygonEditorRef: React.RefObject<PolygonEditorRef | null>;
  polygons: MapPolygonExtendedProps[];
  setLocalState: React.Dispatch<React.SetStateAction<LocalState>>;
  onCancelDrawing: () => void;
}

const toGeoJsonPolygon = (coordinates: LatLng[]) => {
  if (coordinates.length < 3) return null;

  const linearRing = coordinates.map((c) => [c.longitude, c.latitude]);
  const firstCoordinate = coordinates[0];
  if (!firstCoordinate) return null;
  linearRing.push([firstCoordinate.longitude, firstCoordinate.latitude]);

  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [linearRing],
    },
  };
};

export const useNodeGeoEditorContent = ({
  nodeUuid,
  draftCoordinates,
  editable,
  mapRef,
  newPolygon,
  polygonEditorRef,
  polygons,
  setLocalState,
  onCancelDrawing,
}: UseNodeGeoEditorContentProps) => {
  const dispatch = useAppDispatch();
  const confirm = useConfirm();
  const hasValue = polygons.length > 0;

  const savePolygon = useCallback(
    (polygon: MapPolygonExtendedProps | null) => {
      if (!nodeUuid) return;
      const geoJson = polygon ? toGeoJsonPolygon(polygon.coordinates) : null;
      dispatch(
        DataEntryActions.updateAttribute({ uuid: nodeUuid, value: geoJson }),
      );
    },
    [dispatch, nodeUuid],
  );

  const onStartDrawing = useCallback(() => {
    setLocalState((prev) => ({
      ...prev,
      draftCoordinates: [],
      isPolygonSelected: false,
      editable: true,
      polygons,
    }));

    if (polygons.length > 0) {
      return;
    }

    setLocalState((prev) => ({ ...prev, polygons: [] }));
    polygonEditorRef.current?.startPolygon();
  }, [polygonEditorRef, polygons, setLocalState]);

  const onClearPress = useCallback(async () => {
    if (
      await confirm({
        messageKey: "dataEntry:confirmDeleteValue.message",
      })
    ) {
      setLocalState((prev) => ({
        ...prev,
        draftCoordinates: [],
        polygons: [],
        editable: false,
        isPolygonSelected: false,
      }));
      polygonEditorRef.current?.resetAll();
      if (nodeUuid) {
        dispatch(
          DataEntryActions.updateAttribute({ uuid: nodeUuid, value: null }),
        );
      }
    }
  }, [confirm, dispatch, nodeUuid, polygonEditorRef, setLocalState]);

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
    const polygonToSave = polygons[0]
      ? polygons[0]
      : draftCoordinates.length >= 3
        ? {
            key: GEO_POLYGON_KEY,
            coordinates: draftCoordinates,
            strokeWidth: newPolygon.strokeWidth ?? 2,
            strokeColor: newPolygon.strokeColor,
            fillColor: newPolygon.fillColor,
          }
        : null;

    if (!polygonToSave) return;

    setLocalState((prev) => ({
      ...prev,
      polygons: [polygonToSave],
      draftCoordinates: [],
      editable: false,
      isPolygonSelected: false,
    }));
    savePolygon(polygonToSave);
  }, [draftCoordinates, newPolygon, polygons, savePolygon, setLocalState]);

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

  const onMapPress = useCallback(
    (event: MapPressEvent) => {
      if (!editable) return;

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
    [editable, polygonEditorRef, polygons.length, setLocalState],
  );

  const polygonMidpoints = useMemo<PolygonMidpoint[]>(() => {
    const coordinates = polygons[0]?.coordinates ?? [];
    if (coordinates.length < 2) return [];

    return coordinates.map((current, index) => {
      const next = coordinates[(index + 1) % coordinates.length] ?? current;
      return {
        coordinate: GeoUtils.computeMidpointCoordinate(current, next),
        insertAtIndex: index + 1,
      };
    });
  }, [polygons]);

  const onPolygonMidpointPress = useCallback(
    (insertAtIndex: number) => (event: MarkerPressEvent) => {
      event.stopPropagation();
      if (!editable) return;

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
    [editable, setLocalState],
  );

  const toolbar = useMemo(
    () => (
      <NodeGeoToolbar
        draftCoordinates={draftCoordinates}
        editable={editable}
        hasValue={hasValue}
        onCancelDrawing={onCancelDrawing}
        onCenterOnLocation={onCenterOnLocation}
        onClearPress={onClearPress}
        onSaveCurrentPolygon={onSaveCurrentPolygon}
        onStartDrawing={onStartDrawing}
      />
    ),
    [
      draftCoordinates,
      editable,
      hasValue,
      onCancelDrawing,
      onCenterOnLocation,
      onClearPress,
      onSaveCurrentPolygon,
      onStartDrawing,
    ],
  );

  return {
    hasValue,
    onMapPress,
    onPolygonMidpointPress,
    onPolygonSelect,
    onPolygonUnselect,
    polygonMidpoints,
    onPolygonCreate,
    onPolygonChange,
    onPolygonRemove,
    toolbar,
  };
};
