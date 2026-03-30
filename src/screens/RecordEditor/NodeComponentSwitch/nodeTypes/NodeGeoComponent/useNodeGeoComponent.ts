import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  MapPolygonExtendedProps,
  PolygonEditorRef,
  getRandomPolygonColors,
} from "@siposdani87/expo-maps-polygon-editor";
import * as Location from "expo-location";
import MapView, { LatLng } from "react-native-maps";

import { RecordNodes } from "model";
import { DataEntryActions, useAppDispatch, useConfirm } from "state";
import { GeoUtils, Permissions } from "utils";

import { useNodeComponentLocalState } from "../../../useNodeComponentLocalState";
import { NodeComponentProps } from "../nodeComponentPropTypes";

const GEO_POLYGON_KEY = "geo_polygon_0";

export interface LocalState {
  editable: boolean;
  draftCoordinates: LatLng[];
  isPolygonSelected: boolean;
  polygons: MapPolygonExtendedProps[];
  shouldFitInitialPolygon: boolean;
  initialRegion: LatLng & {
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

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
      shouldFitInitialPolygon: polygons.length > 0,
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
    shouldFitInitialPolygon,
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
  }, [polygonEditorRef, polygons]);

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

  return {
    nodeUuid,
    nodeValue,
    draftCoordinates,
    editable,
    initialRegion,
    isPolygonSelected,
    mapRef,
    newPolygon,
    polygonEditorRef,
    polygons,
    setLocalState,
    shouldFitInitialPolygon,
    onCancelDrawing,
    onStartDrawing,
    onClearPress,
  };
};
