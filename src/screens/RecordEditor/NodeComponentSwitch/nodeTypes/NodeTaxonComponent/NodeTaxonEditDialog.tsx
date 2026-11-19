import React, { useCallback } from "react";

import {
  NodeDefs,
  ArenaNodeDefTaxon,
  ArenaRecordNodeValueTaxon,
} from "@openforis/arena-core";

import { log } from "utils";
import { NodeEditDialogInternal } from "../NodeEditDialogInternal";
import { NodeTaxonAutocomplete } from "./NodeTaxonAutocomplete";
import { TaxonSearchItem } from "./taxaSearch";

type NodeTaxonEditDialogProps = {
  nodeDef: ArenaNodeDefTaxon;
  onDismiss: () => void;
  parentNodeUuid?: string;
  selectedTaxon?: TaxonSearchItem | null;
  updateNodeValue: (params: {
    value: ArenaRecordNodeValueTaxon | null;
  }) => void;
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
    ({ value: valueNext }: { value: ArenaRecordNodeValueTaxon | null }) => {
      onDismiss();
      updateNodeValueProp({ value: valueNext });
    },
    [onDismiss, updateNodeValueProp],
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
