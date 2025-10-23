import React, { useCallback } from "react";
import PropTypes from "prop-types";

import { NodeDefs } from "@openforis/arena-core";

import { NodeEditDialogInternal } from "../NodeEditDialogInternal";
import { NodeTaxonAutocomplete } from "./NodeTaxonAutocomplete";

export const NodeTaxonEditDialog = (props) => {
  const {
    nodeDef,
    onDismiss,
    parentNodeUuid,
    selectedTaxon,
    updateNodeValue: updateNodeValueProp,
  } = props;
  if (__DEV__) {
    console.log(
      `rendering NodeTaxonEditDialog for ${NodeDefs.getName(nodeDef)}`
    );
  }
  const updateNodeValue = useCallback(
    ({ value: valueNext }) => {
      onDismiss();
      updateNodeValueProp({ value: valueNext });
    },
    [onDismiss, updateNodeValueProp]
  );

  return (
    <NodeEditDialogInternal
      nodeDef={nodeDef}
      onDismiss={onDismiss}
      parentNodeUuid={parentNodeUuid}
    >
      <NodeTaxonAutocomplete
        nodeDef={nodeDef}
        parentNodeUuid={parentNodeUuid}
        selectedTaxon={selectedTaxon}
        updateNodeValue={updateNodeValue}
      />
    </NodeEditDialogInternal>
  );
};

NodeTaxonEditDialog.propTypes = {
  nodeDef: PropTypes.object.isRequired,
  onDismiss: PropTypes.func.isRequired,
  parentNodeUuid: PropTypes.string,
  selectedTaxon: PropTypes.object,
  updateNodeValue: PropTypes.func.isRequired,
};
