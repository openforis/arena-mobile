import React from "react";

import { Button, HView, IconButton, Modal, VView } from "components";

import { NodeGeoValuePreview } from "screens/RecordEditor/NodeValuePreview/NodeGeoValuePreview";
import { log } from "utils";

import { NodeComponentProps } from "../nodeComponentPropTypes";
import { NodeGeoEditorContent } from "./NodeGeoEditorContent";
import { useNodeGeoComponent } from "./useNodeGeoComponent";
import styles from "./styles";

export const NodeGeoComponent = (props: NodeComponentProps) => {
  const { nodeDef } = props;
  const geoState = useNodeGeoComponent(props);
  const {
    editable,
    nodeValue,
    polygons,
    onCancelDrawing,
    onClearPress,
    onStartDrawing,
  } = geoState;
  const hasValue = polygons.length > 0;

  log.debug(`rendering NodeGeoComponent for ${nodeDef.props.name}`);

  return (
    <VView style={styles.container}>
      {editable ? (
        <Modal
          onDismiss={onCancelDrawing}
          titleKey={
            hasValue ? "dataEntry:geo.editPolygon" : "dataEntry:geo.drawPolygon"
          }
        >
          <VView style={styles.modalContent}>
            <NodeGeoEditorContent {...geoState} />
          </VView>
        </Modal>
      ) : (
        <>
          <NodeGeoValuePreview value={nodeValue} />
          <HView style={styles.toolbar}>
            <Button
              icon={hasValue ? "pencil" : "vector-polygon"}
              textKey={
                hasValue
                  ? "dataEntry:geo.editPolygon"
                  : "dataEntry:geo.drawPolygon"
              }
              onPress={onStartDrawing}
            />
            {hasValue && (
              <IconButton icon="trash-can-outline" onPress={onClearPress} />
            )}
          </HView>
        </>
      )}
    </VView>
  );
};
