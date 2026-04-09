import React from "react";

import { NodeDefs } from "@openforis/arena-core";

import {
  Button,
  GeoPolygonEditor,
  HView,
  IconButton,
  Modal,
  VView,
} from "components";
import { log } from "utils";

import { NodeGeoValuePreview } from "../../../NodeValuePreview/NodeGeoValuePreview";
import { NodeComponentProps } from "../nodeComponentPropTypes";
import { useNodeGeoComponent } from "./useNodeGeoComponent";
import styles from "./styles";

export const NodeGeoComponent = (props: NodeComponentProps) => {
  const { nodeDef } = props;

  log.debug(`rendering NodeGeoComponent for ${NodeDefs.getName(nodeDef)}`);

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
      {hasValue && (
        <HView style={styles.previewToolbarLeft}>
          <IconButton icon="download" onPress={onDownloadGeoJsonPress} />
        </HView>
      )}
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
