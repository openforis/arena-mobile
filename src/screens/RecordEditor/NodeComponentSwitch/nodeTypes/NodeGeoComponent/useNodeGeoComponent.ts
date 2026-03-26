import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  MapPolygonExtendedProps,
  PolygonEditorRef,
  getPolygonFromCoordinates,
  getRandomPolygonColors,
} from "@siposdani87/expo-maps-polygon-editor";
import * as Location from "expo-location";
import MapView from "react-native-maps";

import { DataEntryActions, useAppDispatch, useConfirm } from "state";

import { useNodeComponentLocalState } from "../../../useNodeComponentLocalState";
import { NodeComponentProps } from "../nodeComponentPropTypes";

const GEO_POLYGON_KEY = "geo_polygon_0";

const nodeValueToPolygon = (nodeValue: any): MapPolygonExtendedProps | null => {
  const coordinates: [number, number][] | undefined =
    nodeValue?.geometry?.coordinates?.[0];
  if (!coordinates?.length) return null;
  const [strokeColor, fillColor] = getRandomPolygonColors();
  return {
    key: GEO_POLYGON_KEY,
    coordinates: coordinates.map(([lon, lat]) => ({
      latitude: lat,
      longitude: lon,
    })),
    strokeWidth: 2,
    strokeColor,
    fillColor,
  };
};

const computeRegionFromPolygon = (
  polygon: MapPolygonExtendedProps,
): {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
} => {
  const coords = polygon.coordinates;
  const lats = coords.map((c) => c.latitude);
  const lngs = coords.map((c) => c.longitude);
  const midLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const midLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
  return {
    latitude: midLat,
    longitude: midLng,
    latitudeDelta: Math.max(
      (Math.max(...lats) - Math.min(...lats)) * 1.5,
      0.01,
    ),
    longitudeDelta: Math.max(
      (Math.max(...lngs) - Math.min(...lngs)) * 1.5,
      0.01,
    ),
  };
};

export const useNodeGeoComponent = ({ nodeUuid }: NodeComponentProps) => {
  const dispatch = useAppDispatch();
  const confirm = useConfirm();

  const { value: nodeValue } = useNodeComponentLocalState({ nodeUuid });

  const polygonEditorRef = useRef<PolygonEditorRef>(null);
  const mapRef = useRef<MapView>(null);

  const [editable, setEditable] = useState(false);

  const [polygons, setPolygons] = useState<MapPolygonExtendedProps[]>(() => {
    const polygon = nodeValueToPolygon(nodeValue);
    return polygon ? [polygon] : [];
  });

  useEffect(() => {
    if (editable) return;
    const polygon = nodeValueToPolygon(nodeValue);
    setPolygons(polygon ? [polygon] : []);
  }, [editable, nodeValue]);

  const initialRegion = useMemo(() => {
    const polygon = nodeValueToPolygon(nodeValue);
    if (polygon && polygon.coordinates.length >= 3) {
      return computeRegionFromPolygon(polygon);
    }
    return { latitude: 0, longitude: 0, latitudeDelta: 60, longitudeDelta: 60 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally only on mount

  const savePolygon = useCallback(
    (polygon: MapPolygonExtendedProps | null) => {
      if (!nodeUuid) return;
      const geoJson = polygon
        ? getPolygonFromCoordinates(polygon.coordinates)
        : null;
      dispatch(
        DataEntryActions.updateAttribute({ uuid: nodeUuid, value: geoJson }),
      );
    },
    [dispatch, nodeUuid],
  );

  const onPolygonCreate = useCallback(
    (polygon: MapPolygonExtendedProps) => {
      setPolygons([polygon]);
      setEditable(false);
      savePolygon(polygon);
    },
    [savePolygon],
  );

  const onPolygonChange = useCallback(
    (index: number, polygon: MapPolygonExtendedProps) => {
      setPolygons((prev) => {
        const updated = [...prev];
        updated[index] = polygon;
        return updated;
      });
      savePolygon(polygon);
    },
    [savePolygon],
  );

  const onPolygonRemove = useCallback(
    (_index: number) => {
      setPolygons([]);
      savePolygon(null);
    },
    [savePolygon],
  );

  const onStartDrawing = useCallback(() => {
    setPolygons([]);
    setEditable(true);
    polygonEditorRef.current?.startPolygon();
  }, []);

  const onCancelDrawing = useCallback(() => {
    const polygon = nodeValueToPolygon(nodeValue);
    setPolygons(polygon ? [polygon] : []);
    setEditable(false);
    polygonEditorRef.current?.resetAll();
  }, [nodeValue]);

  const onClearPress = useCallback(async () => {
    if (
      await confirm({
        messageKey: "dataEntry:confirmDeleteValue.message",
      })
    ) {
      setPolygons([]);
      setEditable(false);
      polygonEditorRef.current?.resetAll();
      if (nodeUuid) {
        dispatch(
          DataEntryActions.updateAttribute({ uuid: nodeUuid, value: null }),
        );
      }
    }
  }, [confirm, dispatch, nodeUuid]);

  const onCenterOnLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;
    const location = await Location.getCurrentPositionAsync({});
    mapRef.current?.animateToRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  }, []);

  return {
    editable,
    initialRegion,
    mapRef,
    polygonEditorRef,
    polygons,
    onCancelDrawing,
    onCenterOnLocation,
    onClearPress,
    onPolygonChange,
    onPolygonCreate,
    onPolygonRemove,
    onStartDrawing,
  };
};
