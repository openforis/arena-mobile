import React from "react";

import { Button, HView, IconButton, Modal, VView } from "components";

import { NodeComponentProps } from "../nodeComponentPropTypes";
import { NodeGeoValuePreview } from "../../../NodeValuePreview/NodeGeoValuePreview";
import { GeoPolygonEditorContent } from "./GeoPolygonEditorContent";
import { useNodeGeoComponent } from "./useNodeGeoComponent";
import styles from "./styles";

export const NodeGeoComponent = (props: NodeComponentProps) => {
  const { nodeDef } = props;
  const {
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
  } = useNodeGeoComponent(props);

  const hasValue = polygons.length > 0;

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

  if (!editable && !hasValue) {
    return (
      <Button
        icon="vector-polygon"
        textKey="dataEntry:geo.drawPolygon"
        onPress={onStartDrawing}
      />
    );
  }

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
      ) : (
        <>
          <NodeGeoValuePreview
            nodeDef={nodeDef}
            value={nodeValue}
          />
          {toolbar}
        </>
      )}
    </VView>
  );
};
