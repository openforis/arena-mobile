import React, { useCallback } from "react";

import { NodeDefs } from "@openforis/arena-core";

import { NodeCodeAutocomplete } from "./NodeCodeAutocomplete";
import { NodeEditDialogInternal } from "../NodeEditDialogInternal";

type NodeCodeEditDialogProps = {
  editable?: boolean;
  itemLabelFunction: (item: any) => string;
  items?: any[];
  nodeDef?: any;
  onDismiss?: () => void;
  onItemAdd: (uuid: string) => void;
  onItemRemove: (uuid: string) => void;
  onSingleValueChange: (uuid: string) => void;
  parentNodeUuid?: string;
  selectedItems?: any[];
};

export const NodeCodeEditDialog = (props: NodeCodeEditDialogProps) => {
  const {
    editable = true,
    itemLabelFunction,
    items = [],
    nodeDef,
    onDismiss,
    onItemAdd,
    onItemRemove,
    onSingleValueChange: onSingleValueChangeProp,
    parentNodeUuid,
    selectedItems = [],
  } = props;

  const multiple = NodeDefs.isMultiple(nodeDef);

  const onSingleValueChange = useCallback(
    (selectedItemUuid: any) => {
      onSingleValueChangeProp?.(selectedItemUuid);
      if (selectedItemUuid) {
        onDismiss?.();
      }
    },
    [onDismiss, onSingleValueChangeProp]
  );

  return (
    <NodeEditDialogInternal
      nodeDef={nodeDef}
      onDismiss={onDismiss}
      parentNodeUuid={parentNodeUuid}
    >
      <NodeCodeAutocomplete
        editable={editable}
        itemLabelFunction={itemLabelFunction}
        items={items}
        onItemAdd={onItemAdd}
        onItemRemove={onItemRemove}
        onSingleValueChange={onSingleValueChange}
        selectedItems={selectedItems}
        multiple={multiple}
      />
    </NodeEditDialogInternal>
  );
};
