import React from "react";
import { StyleSheet, View as RNView } from "react-native";

import { PolygonEditor } from "@siposdani87/expo-maps-polygon-editor";
import MapView, {
  Marker,
  Polygon as MapPolygon,
  Polyline,
} from "react-native-maps";

import { Button, HView, IconButton, Text, VView } from "components";

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
  helperText: {
    textAlign: "center",
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  draftPoint: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    backgroundColor: "#ffffff",
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
  } = useNodeGeoComponent(props);

  return (
    <VView style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onPress={onMapPress}
      >
        {editable && polygons.length === 0 && draftCoordinates.length > 0 && (
          <>
            {draftCoordinates.length >= 3 ? (
              <MapPolygon
                coordinates={draftCoordinates}
                strokeColor={newPolygon.strokeColor}
                strokeWidth={newPolygon.strokeWidth}
                fillColor={newPolygon.fillColor}
              />
            ) : (
              <Polyline
                coordinates={draftCoordinates}
                strokeColor={newPolygon.strokeColor}
                strokeWidth={newPolygon.strokeWidth}
              />
            )}
            {draftCoordinates.map((coordinate, index) => (
              <Marker
                key={`draft-point-${index}`}
                coordinate={coordinate}
                anchor={{ x: 0.5, y: 0.5 }}
                tracksViewChanges={false}
              >
                <RNView
                  style={[
                    styles.draftPoint,
                    { borderColor: newPolygon.strokeColor },
                  ]}
                />
              </Marker>
            ))}
          </>
        )}
        <PolygonEditor
          ref={polygonEditorRef}
          newPolygon={newPolygon}
          polygons={polygons}
          onPolygonCreate={onPolygonCreate}
          onPolygonChange={onPolygonChange}
          onPolygonRemove={onPolygonRemove}
          disabled={!editable}
        />
      </MapView>
      {/* {editable && (
        <Text style={styles.helperText}>Tap on map to add polygon points</Text>
      )} */}
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
