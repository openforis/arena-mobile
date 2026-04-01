import React, { useMemo } from "react";

import { Polygon as MapPolygon } from "react-native-maps";

import {
  Button,
  HView,
  IconButton,
  MapViewWithInitialFit,
  Modal,
  VView,
} from "components";

import { NodeComponentProps } from "../nodeComponentPropTypes";
import { GeoPolygonEditorContent } from "./GeoPolygonEditorContent";
import { useNodeGeoComponent } from "./useNodeGeoComponent";
import styles from "./styles";

export const NodeGeoComponent = (props: NodeComponentProps) => {
  const {
    draftCoordinates,
    editable,
    initialRegion,
    mapRef,
    newPolygon,
    polygonEditorRef,
    polygons,
    setDraftCoordinates,
    setPolygons,
    onCancelDrawing,
    onCenterOnLocation,
    onClearPress,
    onSaveDrawing,
    onStartDrawing,
  } = useNodeGeoComponent(props);

  const hasValue = polygons.length > 0;
  const visibleCoordinates = useMemo(
    () => polygons[0]?.coordinates ?? draftCoordinates,
    [draftCoordinates, polygons],
  );

  const toolbar = (
    <HView style={styles.toolbar}>
      {hasValue && (
        <IconButton
          icon="crosshairs-gps"
          onPress={onCenterOnLocation}
          size={24}
        />
      )}
      <Button
        icon={hasValue ? "pencil" : "vector-polygon"}
        textKey={
          hasValue ? "dataEntry:geo.editPolygon" : "dataEntry:geo.drawPolygon"
        }
        onPress={onStartDrawing}
      />
      <IconButton icon="trash-can-outline" onPress={onClearPress} />
    </HView>
  );

  return (
    <VView style={hasValue ? styles.container : undefined}>
      {editable ? (
        <Modal
          onDismiss={onCancelDrawing}
          titleKey={
            hasValue ? "dataEntry:geo.editPolygon" : "dataEntry:geo.drawPolygon"
          }
        >
          <GeoPolygonEditorContent
            draftCoordinates={draftCoordinates}
            initialRegion={initialRegion}
            mapRef={mapRef}
            newPolygon={newPolygon}
            polygonEditorRef={polygonEditorRef}
            polygons={polygons}
            setDraftCoordinates={setDraftCoordinates}
            setPolygons={setPolygons}
            onCancelDrawing={onCancelDrawing}
            onCenterOnLocation={onCenterOnLocation}
            onSaveDrawing={onSaveDrawing}
          />
        </Modal>
      ) : hasValue ? (
        <>
          <MapViewWithInitialFit
            ref={mapRef}
            style={styles.map}
            initialRegion={initialRegion}
            fitToCoordinatesOnReady={visibleCoordinates}
            fitOnlyOnce={true}
          >
            {!!polygons[0] && (
              <MapPolygon
                coordinates={polygons[0].coordinates}
                strokeColor={polygons[0].strokeColor}
                strokeWidth={polygons[0].strokeWidth}
                fillColor={polygons[0].fillColor}
              />
            )}
          </MapViewWithInitialFit>
          {toolbar}
        </>
      ) : (
        <Button
          icon="vector-polygon"
          textKey="dataEntry:geo.drawPolygon"
          onPress={onStartDrawing}
        />
      )}
    </VView>
  );
};
