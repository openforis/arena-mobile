import React, { useCallback } from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { NodeDefs } from "@openforis/arena-core";

import { NodeEditDialogInternal } from "../NodeEditDialogInternal";
import { NodeTaxonAutocomplete } from "./NodeTaxonAutocomplete";

export const NodeTaxonEditDialog = (props: any) => {
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
    // @ts-expect-error TS(7031): Binding element 'valueNext' implicitly has an 'any... Remove this comment to see the full error message
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
