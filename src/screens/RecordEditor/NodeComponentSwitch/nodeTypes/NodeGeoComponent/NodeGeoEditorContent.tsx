import React, { useMemo } from "react";

import { PolygonEditor } from "@siposdani87/expo-maps-polygon-editor";

import { MapViewWithInitialFit, Text } from "components";

import { NodeGeoDraftLayer } from "./NodeGeoDraftLayer";
import { NodeGeoMidpointsLayer } from "./NodeGeoMidpointsLayer";
import { NodeGeoVerticesLayer } from "./NodeGeoVerticesLayer";
import { NodeGeoEditorContentToolbar } from "./NodeGeoEditorContentToolbar";
import {
  UseNodeGeoEditorContentProps,
  useNodeGeoEditorContent,
} from "./useNodeGeoEditorContent";
import styles from "./styles";

interface NodeGeoEditorContentProps extends UseNodeGeoEditorContentProps {
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  isPolygonSelected: boolean;
  shouldFitInitialPolygon: boolean;
  onCancelDrawing: () => void;
}

const determineHelperTextKey = ({
  hasValue,
  isPolygonSelected,
}: {
  hasValue: boolean;
  isPolygonSelected: boolean;
}) => {
  if (hasValue) {
    if (isPolygonSelected) {
      return "dataEntry:geo.editPolygonInstructions";
    }
    return "dataEntry:geo.selectPolygonInstructions";
  }
  return "dataEntry:geo.tapToAddPoints";
};

export const NodeGeoEditorContent = ({
  draftCoordinates,
  initialRegion,
  isPolygonSelected,
  mapRef,
  newPolygon,
  polygonEditorRef,
  polygons,
  setLocalState,
  shouldFitInitialPolygon,
  onCancelDrawing,
  onSavePolygon,
}: NodeGeoEditorContentProps) => {
  const {
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
  } = useNodeGeoEditorContent({
    draftCoordinates,
    mapRef,
    newPolygon,
    polygonEditorRef,
    polygons,
    setLocalState,
    onSavePolygon,
  });

  const initialFitCoordinates = useMemo(
    () =>
      shouldFitInitialPolygon
        ? (polygons[0]?.coordinates ?? undefined)
        : undefined,
    [polygons, shouldFitInitialPolygon],
  );

  const helperTextKey = determineHelperTextKey({ hasValue, isPolygonSelected });

  return (
    <>
      <MapViewWithInitialFit
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onPress={onMapPress}
        fitToCoordinatesOnReady={initialFitCoordinates}
        fitOnlyOnce={true}
      >
        {polygons.length === 0 && (
          <NodeGeoDraftLayer
            draftCoordinates={draftCoordinates}
            newPolygon={newPolygon}
          />
        )}
        {isPolygonSelected && !!polygons[0] && (
          <>
            <NodeGeoMidpointsLayer
              midpoints={polygonMidpoints}
              strokeColor={polygons[0]?.strokeColor ?? newPolygon.strokeColor}
              onMidpointPress={onPolygonMidpointPress}
            />
            <NodeGeoVerticesLayer polygon={polygons[0]} />
          </>
        )}
        <PolygonEditor
          ref={polygonEditorRef}
          newPolygon={newPolygon}
          polygons={polygons}
          onPolygonCreate={onPolygonCreate}
          onPolygonChange={onPolygonChange}
          onPolygonRemove={onPolygonRemove}
          onPolygonSelect={onPolygonSelect}
          onPolygonUnselect={onPolygonUnselect}
        />
      </MapViewWithInitialFit>

      {<Text style={styles.helperText} textKey={helperTextKey} />}

      <NodeGeoEditorContentToolbar
        draftCoordinates={draftCoordinates}
        hasValue={hasValue}
        onCancelDrawing={onCancelDrawing}
        onCenterOnLocation={onCenterOnLocation}
        onSaveCurrentPolygon={onSaveCurrentPolygon}
        onUndoLastCoordinate={onUndoLastCoordinate}
      />
    </>
  );
};
