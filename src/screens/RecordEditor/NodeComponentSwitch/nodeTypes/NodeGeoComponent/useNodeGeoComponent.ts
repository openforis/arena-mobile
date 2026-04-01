import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  MapPolygonExtendedProps,
  PolygonEditorRef,
  getRandomPolygonColors,
} from "@siposdani87/expo-maps-polygon-editor";
import * as Location from "expo-location";
import MapView, { LatLng } from "react-native-maps";

import { DataEntryActions, useAppDispatch, useConfirm } from "state";
import { GeoUtils, Permissions } from "utils";

import { useNodeComponentLocalState } from "../../../useNodeComponentLocalState";
import { NodeComponentProps } from "../nodeComponentPropTypes";

const GEO_POLYGON_KEY = "geo_polygon_0";

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
  let coordinates: [number, number][] | undefined =
    nodeValue?.geometry?.coordinates?.[0];
  if (!coordinates?.length) return null;

  // Remove closing coordinate if it equals the first one
  const firstCoord = coordinates[0];
  const lastCoord = coordinates[coordinates.length - 1];
  if (
    firstCoord?.[0] === lastCoord?.[0] &&
    firstCoord?.[1] === lastCoord?.[1]
  ) {
    coordinates = coordinates.slice(0, -1);
  }

  const [strokeColor, fillColor] = getRandomPolygonColors();
  return {
    key: GEO_POLYGON_KEY,
    coordinates: coordinates.map(([longitude, latitude]) => ({
      latitude,
      longitude,
    })),
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

  const [editable, setEditable] = useState(false);
  const [draftCoordinates, setDraftCoordinates] = useState<LatLng[]>([]);

  const [polygons, setPolygons] = useState<MapPolygonExtendedProps[]>(() => {
    const polygon = nodeValueToPolygon(nodeValue);
    return polygon ? [polygon] : [];
  });

  useEffect(() => {
    if (editable) return;
    setPolygons(nodeValuePolygons);
  }, [editable, nodeValuePolygons]);

  const initialRegion = useMemo(() => {
    const polygon = nodeValueToPolygon(nodeValue);
    if (polygon && polygon.coordinates.length >= 3) {
      return GeoUtils.computeRegionFromCoordinates(polygon.coordinates);
    }
    return GeoUtils.defaultMapRegion;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally only on mount

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

  const onSaveDrawing = useCallback(
    (polygon: MapPolygonExtendedProps | null) => {
      setPolygons(polygon ? [polygon] : []);
      setDraftCoordinates([]);
      setEditable(false);
      polygonEditorRef.current?.resetAll();
      savePolygon(polygon);
    },
    [savePolygon],
  );

  const onStartDrawing = useCallback(() => {
    setDraftCoordinates([]);
    setEditable(true);
    if (polygons.length > 0) {
      polygonEditorRef.current?.selectPolygonByIndex(0);
      return;
    }

    setPolygons([]);
    polygonEditorRef.current?.startPolygon();
  }, [polygons.length]);

  const onCancelDrawing = useCallback(() => {
    setDraftCoordinates([]);
    setPolygons(nodeValuePolygons);
    setEditable(false);
    polygonEditorRef.current?.resetAll();
  }, [nodeValuePolygons]);

  const onClearPress = useCallback(async () => {
    if (
      await confirm({
        messageKey: "dataEntry:confirmDeleteValue.message",
      })
    ) {
      setDraftCoordinates([]);
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
    if (!(await Permissions.requestLocationForegroundPermission())) return;

    const location = await Location.getCurrentPositionAsync({});
    mapRef.current?.animateToRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  }, []);

  return {
    draftCoordinates,
    editable,
    initialRegion,
    mapRef,
    newPolygon,
    nodeValue,
    polygonEditorRef,
    polygons,
    setDraftCoordinates,
    setPolygons,
    onCancelDrawing,
    onCenterOnLocation,
    onClearPress,
    onSaveDrawing,
    onStartDrawing,
  };
};
