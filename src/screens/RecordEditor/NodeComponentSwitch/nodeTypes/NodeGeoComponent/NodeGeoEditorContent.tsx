import React, { useMemo } from "react";

import { PolygonEditor } from "@siposdani87/expo-maps-polygon-editor";

import { MapViewWithInitialFit, Text } from "components";

import { NodeGeoDraftLayer } from "./NodeGeoDraftLayer";
import { NodeGeoMidpointsLayer } from "./NodeGeoMidpointsLayer";
import styles from "./styles";
import {
  UseNodeGeoEditorContentProps,
  useNodeGeoEditorContent,
} from "./useNodeGeoEditorContent";

interface NodeGeoEditorContentProps extends UseNodeGeoEditorContentProps {
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  isPolygonSelected: boolean;
  shouldFitInitialPolygon: boolean;
}

export const NodeGeoEditorContent = ({
  nodeUuid,
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
}: NodeGeoEditorContentProps) => {
  const {
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
  } = useNodeGeoEditorContent({
    nodeUuid,
    draftCoordinates,
    editable,
    mapRef,
    newPolygon,
    polygonEditorRef,
    polygons,
    setLocalState,
    onCancelDrawing,
  });

  const initialFitCoordinates = useMemo(
    () =>
      shouldFitInitialPolygon
        ? (polygons[0]?.coordinates ?? undefined)
        : undefined,
    [polygons, shouldFitInitialPolygon],
  );

  if (!editable && !hasValue) {
    return toolbar;
  }

  return (
    <>
      <MapViewWithInitialFit
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onPress={onMapPress}
        fitToCoordinatesOnReady={initialFitCoordinates}
        fitOnlyOnce={true}
        onInitialFitApplied={() => {
          setLocalState((prev) => ({
            ...prev,
            shouldFitInitialPolygon: false,
          }));
        }}
      >
        {editable && polygons.length === 0 && (
          <NodeGeoDraftLayer
            draftCoordinates={draftCoordinates}
            newPolygon={newPolygon}
          />
        )}
        {editable && isPolygonSelected && polygons.length > 0 && (
          <NodeGeoMidpointsLayer
            midpoints={polygonMidpoints}
            strokeColor={newPolygon.strokeColor}
            onMidpointPress={onPolygonMidpointPress}
          />
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
          disabled={!editable}
        />
      </MapViewWithInitialFit>
      {editable && (
        <Text
          style={styles.helperText}
          textKey={
            hasValue
              ? isPolygonSelected
                ? "dataEntry:geo.editPolygonInstructions"
                : "dataEntry:geo.selectPolygonInstructions"
              : "dataEntry:geo.tapToAddPoints"
          }
        />
      )}
      {toolbar}
    </>
  );
};
