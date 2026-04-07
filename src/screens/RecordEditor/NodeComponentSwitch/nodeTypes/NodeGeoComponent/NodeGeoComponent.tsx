import React from "react";

import {
  Button,
  GeoPolygonEditor,
  HView,
  IconButton,
  Modal,
  VView,
} from "components";

import { NodeComponentProps } from "../nodeComponentPropTypes";
import { NodeGeoValuePreview } from "../../../NodeValuePreview/NodeGeoValuePreview";
import { useNodeGeoComponent } from "./useNodeGeoComponent";
import styles from "components/GeoPolygonEditor/styles";

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
    onDownloadGeoJsonPress,
    onSaveDrawing,
    onStartDrawing,
  } = useNodeGeoComponent(props);

  const hasValue = initialPolygons.length > 0;

  const toolbar = (
    <HView style={styles.previewToolbar}>
      <HView style={styles.previewToolbarCenter}>
        <Button
          icon={hasValue ? "pencil" : "vector-polygon"}
          textKey={
            hasValue ? "dataEntry:geo.editPolygon" : "dataEntry:geo.drawPolygon"
          }
          onPress={onStartDrawing}
        />
      </HView>
      {hasValue && (
        <HView style={styles.previewToolbarRight}>
          <IconButton icon="download" onPress={onDownloadGeoJsonPress} />
          <IconButton icon="trash-can-outline" onPress={onClearPress} />
        </HView>
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
          <GeoPolygonEditor
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
