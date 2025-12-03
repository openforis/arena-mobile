import React, { useCallback } from "react";

import { NodeDefs } from "@openforis/arena-core";

import { log } from "utils";
import { NodeEditDialogInternal } from "../NodeEditDialogInternal";
import { NodeTaxonAutocomplete } from "./NodeTaxonAutocomplete";

type NodeTaxonEditDialogProps = {
  nodeDef: any;
  onDismiss: () => void;
  parentNodeUuid?: string;
  selectedTaxon?: any;
  updateNodeValue: (params: { value: any }) => void;
};

export const NodeTaxonEditDialog = (props: NodeTaxonEditDialogProps) => {
  const {
    nodeDef,
    onDismiss,
    parentNodeUuid,
    selectedTaxon,
    updateNodeValue: updateNodeValueProp,
  } = props;
  log.debug(`rendering NodeTaxonEditDialog for ${NodeDefs.getName(nodeDef)}`);
  const updateNodeValue = useCallback(
    ({ value: valueNext }: { value: any }) => {
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
