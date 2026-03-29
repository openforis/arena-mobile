import React from "react";

import { Modal, VView } from "components";

import { log } from "utils";
import { NodeComponentProps } from "../nodeComponentPropTypes";
import { NodeGeoEditorContent } from "./NodeGeoEditorContent";
import { useNodeGeoComponent } from "./useNodeGeoComponent";
import styles from "./styles";

export const NodeGeoComponent = (props: NodeComponentProps) => {
  const { nodeDef } = props;
  const geoState = useNodeGeoComponent(props);
  const { editable, polygons, onCancelDrawing } = geoState;
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
        <NodeGeoEditorContent {...geoState} />
      )}
    </VView>
  );
};
