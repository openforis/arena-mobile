import React from "react";
import { StyleSheet } from "react-native";

import { PolygonEditor } from "@siposdani87/expo-maps-polygon-editor";
import MapView from "react-native-maps";

import { Button, HView, IconButton, VView } from "components";

import { NodeComponentProps } from "../nodeComponentPropTypes";
import { useNodeGeoComponent } from "./useNodeGeoComponent";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 300,
  },
  map: {
    flex: 1,
    minHeight: 250,
  },
  toolbar: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});

export const NodeGeoComponent = (props: NodeComponentProps) => {
  const {
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
  } = useNodeGeoComponent(props);

  return (
    <VView style={styles.container}>
      <MapView ref={mapRef} style={styles.map} initialRegion={initialRegion}>
        <PolygonEditor
          ref={polygonEditorRef}
          polygons={polygons}
          onPolygonCreate={onPolygonCreate}
          onPolygonChange={onPolygonChange}
          onPolygonRemove={onPolygonRemove}
          disabled={!editable}
        />
      </MapView>
      <HView style={styles.toolbar}>
        <IconButton
          icon="crosshairs-gps"
          onPress={onCenterOnLocation}
          size={24}
        />
        {editable ? (
          <Button textKey="common:cancel" onPress={onCancelDrawing} />
        ) : (
          <Button
            icon={polygons.length > 0 ? "pencil" : "vector-polygon"}
            textKey={
              polygons.length > 0
                ? "dataEntry:geo.editPolygon"
                : "dataEntry:geo.drawPolygon"
            }
            onPress={onStartDrawing}
          />
        )}
        {polygons.length > 0 && !editable && (
          <IconButton icon="trash-can-outline" onPress={onClearPress} />
        )}
      </HView>
    </VView>
  );
};
