import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  MapPolygonExtendedProps,
  PolygonEditorRef,
  getRandomPolygonColors,
} from "@siposdani87/expo-maps-polygon-editor";
import * as Location from "expo-location";
import MapView, {
  LatLng,
  MapPressEvent,
  MarkerPressEvent,
} from "react-native-maps";

import { RecordNodes } from "model";
import { DataEntryActions, useAppDispatch, useConfirm } from "state";
import { GeoUtils, Permissions } from "utils";

import { useNodeComponentLocalState } from "../../../useNodeComponentLocalState";
import { NodeComponentProps } from "../nodeComponentPropTypes";

const GEO_POLYGON_KEY = "geo_polygon_0";

interface PolygonMidpoint {
  coordinate: LatLng;
  insertAtIndex: number;
}

interface LocalState {
  editable: boolean;
  draftCoordinates: LatLng[];
  isPolygonSelected: boolean;
  polygons: MapPolygonExtendedProps[];
  initialRegion: LatLng & {
    latitudeDelta: number;
    longitudeDelta: number;
  };
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

const nodeValueToPolygon = (nodeValue: any): MapPolygonExtendedProps | null => {
  const coordinates = RecordNodes.getPolygonCoordinatesFromNodeValue(nodeValue);
  if (!coordinates?.length) return null;
  const [strokeColor, fillColor] = getRandomPolygonColors();
  return {
    key: GEO_POLYGON_KEY,
    coordinates,
    strokeWidth: 2,
    strokeColor,
    fillColor,
  };
};

export const useNodeGeoComponent = ({ nodeUuid }: NodeComponentProps) => {
  const dispatch = useAppDispatch();
  const confirm = useConfirm();

  const { value: nodeValue } = useNodeComponentLocalState({ nodeUuid });

  const nodeValuePolygons = useMemo(() => {
    const polygon = nodeValueToPolygon(nodeValue);
    return polygon ? [polygon] : [];
  }, [nodeValue]);

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

  const polygonEditorRef = useRef<PolygonEditorRef>(null);
  const mapRef = useRef<MapView>(null);

  const [localState, setLocalState] = useState<LocalState>(() => {
    const polygon = nodeValueToPolygon(nodeValue);
    const polygons = polygon ? [polygon] : [];

    return {
      editable: false,
      draftCoordinates: [],
      isPolygonSelected: false,
      polygons,
      initialRegion:
        polygon && polygon.coordinates.length >= 3
          ? GeoUtils.computeRegionFromCoordinates(polygon.coordinates)
          : GeoUtils.defaultMapRegion,
    };
  });

  const {
    editable,
    draftCoordinates,
    isPolygonSelected,
    polygons: localPolygons,
    initialRegion,
  } = localState;

  const polygons = editable ? localPolygons : nodeValuePolygons;

  useEffect(() => {
    if (nodeValuePolygons.length > 0) return;

    let active = true;

    const setInitialRegionFromCurrentLocation = async () => {
      if (!(await Permissions.requestLocationForegroundPermission())) return;

      const location = await Location.getCurrentPositionAsync();
      if (!active) return;

      const { latitude, longitude } = location.coords;
      setLocalState((prev) => ({
        ...prev,
        initialRegion: {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
      }));
    };

    void setInitialRegionFromCurrentLocation();

    return () => {
      active = false;
    };
  }, [nodeValuePolygons.length]);

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

  const onPolygonCreate = useCallback((polygon: MapPolygonExtendedProps) => {
    setLocalState((prev) => ({
      ...prev,
      polygons: [polygon],
      draftCoordinates: [],
      editable: true,
    }));
  }, []);

  const onPolygonChange = useCallback(
    (index: number, polygon: MapPolygonExtendedProps) => {
      setLocalState((prev) => {
        const updated = [...prev.polygons];
        updated[index] = polygon;
        return { ...prev, polygons: updated };
      });
    },
    [],
  );

  const onPolygonRemove = useCallback((_index: number) => {
    setLocalState((prev) => ({
      ...prev,
      polygons: [],
      draftCoordinates: [],
      isPolygonSelected: false,
    }));
  }, []);

  const onPolygonSelect = useCallback(() => {
    setLocalState((prev) => ({ ...prev, isPolygonSelected: true }));
  }, []);

  const onPolygonUnselect = useCallback(() => {
    setLocalState((prev) => ({ ...prev, isPolygonSelected: false }));
  }, []);

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
  }, [polygons]);

  const onCancelDrawing = useCallback(() => {
    setLocalState((prev) => ({
      ...prev,
      draftCoordinates: [],
      polygons: nodeValuePolygons,
      editable: false,
      isPolygonSelected: false,
    }));
    polygonEditorRef.current?.resetAll();
  }, [nodeValuePolygons]);

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
  }, [confirm, dispatch, nodeUuid]);

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
  }, []);

  const onMapPress = useCallback(
    (event: MapPressEvent) => {
      if (!editable) return;
      const { coordinate } = event.nativeEvent ?? {};
      if (!coordinate) return;
      if (polygons.length === 0) {
        // Add point (allow unlimited points during drawing)
        setLocalState((prev) => ({
          ...prev,
          draftCoordinates: [...prev.draftCoordinates, coordinate],
        }));
      }
      polygonEditorRef.current?.setCoordinate(coordinate);
    },
    [editable, polygons.length],
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
    [editable],
  );

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
  }, [draftCoordinates, newPolygon, polygons, savePolygon]);

  return {
    draftCoordinates,
    editable,
    initialRegion,
    isPolygonSelected,
    mapRef,
    newPolygon,
    onMapPress,
    onPolygonMidpointPress,
    onPolygonSelect,
    onPolygonUnselect,
    polygonEditorRef,
    polygonMidpoints,
    polygons,
    onCancelDrawing,
    onCenterOnLocation,
    onClearPress,
    onPolygonChange,
    onPolygonCreate,
    onPolygonRemove,
    onSaveCurrentPolygon,
    onStartDrawing,
  };
};
