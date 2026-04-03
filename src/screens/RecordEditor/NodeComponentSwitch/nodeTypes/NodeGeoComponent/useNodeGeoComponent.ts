import { useCallback, useMemo, useRef, useState } from "react";

import {
  MapPolygonExtendedProps,
  getRandomPolygonColors,
} from "./polygonEditorUtils";
import MapView from "react-native-maps";

import { LatLng } from "model";

import { DataEntryActions, useAppDispatch, useConfirm } from "state";
import { GeoUtils } from "utils";

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
  const coordinates = GeoUtils.extractPolygonCoordinatesFromGeoJson(nodeValue);
  if (!coordinates) return null;

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

  const mapRef = useRef<MapView | null>(null);

  const [editable, setEditable] = useState(false);

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
      setEditable(false);
      savePolygon(polygon);
    },
    [savePolygon],
  );

  const onStartDrawing = useCallback(() => {
    setEditable(true);
  }, []);

  const onCancelDrawing = useCallback(() => {
    setEditable(false);
  }, []);

  const onClearPress = useCallback(async () => {
    if (
      await confirm({
        messageKey: "dataEntry:confirmDeleteValue.message",
      })
    ) {
      setEditable(false);
      if (nodeUuid) {
        dispatch(
          DataEntryActions.updateAttribute({ uuid: nodeUuid, value: null }),
        );
      }
    }
  }, [confirm, dispatch, nodeUuid]);

  return {
    editable,
    initialRegion,
    initialPolygons: nodeValuePolygons,
    mapRef,
    nodeValue,
    onCancelDrawing,
    onClearPress,
    onSaveDrawing,
    onStartDrawing,
  };
};
