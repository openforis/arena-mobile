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
    editable,
    initialRegion,
    mapRef,
    initialPolygons,
    nodeValue,
    onCancelDrawing,
    onClearPress,
    onSaveDrawing,
    onStartDrawing,
  } = useNodeGeoComponent(props);

  const hasValue = initialPolygons.length > 0;

  const toolbar = (
    <HView style={styles.toolbar}>
      <Button
        icon={hasValue ? "pencil" : "vector-polygon"}
        textKey={
          hasValue ? "dataEntry:geo.editPolygon" : "dataEntry:geo.drawPolygon"
        }
        onPress={onStartDrawing}
      />
      {hasValue && (
        <IconButton icon="trash-can-outline" onPress={onClearPress} />
      )}
    </HView>
  );

  if (!editable && !hasValue) {
    return toolbar;
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
            initialRegion={initialRegion}
            mapRef={mapRef}
            initialPolygons={initialPolygons}
            onCancelDrawing={onCancelDrawing}
            onSaveDrawing={onSaveDrawing}
          />
        </Modal>
      ) : (
        <>
          <NodeGeoValuePreview nodeDef={nodeDef} value={nodeValue} />
          {toolbar}
        </>
      )}
    </VView>
  );
};
