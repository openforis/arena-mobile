import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  MapPolygonExtendedProps,
  PolygonEditorRef,
  getRandomPolygonColors,
} from "@siposdani87/expo-maps-polygon-editor";
import * as Location from "expo-location";
import MapView, { LatLng, MapPressEvent } from "react-native-maps";

import { DataEntryActions, useAppDispatch, useConfirm } from "state";
import { GeoUtils, Permissions } from "utils";

import { useNodeComponentLocalState } from "../../../useNodeComponentLocalState";
import { NodeComponentProps } from "../nodeComponentPropTypes";
import { LocalState } from "./types";

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
  const coordinates: [number, number][] | undefined =
    nodeValue?.geometry?.coordinates?.[0];
  if (!coordinates?.length) return null;
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

  // When user has tapped 3 times (draft coordinates), create a polygon for editing
  useEffect(() => {
    if (!editable || draftCoordinates.length !== 3 || polygons.length > 0) return;

    const [strokeColor, fillColor] = getRandomPolygonColors();
    const newPoly: MapPolygonExtendedProps = {
      key: GEO_POLYGON_KEY,
      coordinates: draftCoordinates,
      strokeWidth: 2,
      strokeColor,
      fillColor,
    };

    setPolygons([newPoly]);
    // Keep draftCoordinates so undo can work - don't clear them yet
    // Automatically select and prepare for editing in the polygon editor
    polygonEditorRef.current?.selectPolygonByIndex(0);
  }, [editable, draftCoordinates, polygons.length]);

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

  const onPolygonCreate = useCallback(
    (polygon: MapPolygonExtendedProps) => {
      setPolygons([polygon]);
      setDraftCoordinates([]);
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

  const onMapPress = useCallback(
    (event: MapPressEvent) => {
      if (!editable) return;
      const nativeEvent = event.nativeEvent;
      if (!nativeEvent) return;
      if (polygons.length === 0) {
        setDraftCoordinates((prev) =>
          prev.length < 3 ? [...prev, nativeEvent.coordinate] : prev,
        );
      }
      polygonEditorRef.current?.setCoordinate(nativeEvent.coordinate);
    },
    [editable, polygons.length],
  );

  return {
    draftCoordinates,
    editable,
    initialRegion,
    mapRef,
    newPolygon,
    onMapPress,
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

export type { LocalState };
