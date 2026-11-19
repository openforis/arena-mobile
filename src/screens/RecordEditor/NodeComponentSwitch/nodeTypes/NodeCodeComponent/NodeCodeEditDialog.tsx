import React, { useCallback } from "react";

import {
  ArenaCategoryItem,
  ArenaNodeDefCode,
  NodeDefs,
} from "@openforis/arena-core";

import { NodeCodeAutocomplete } from "./NodeCodeAutocomplete";
import { NodeEditDialogInternal } from "../NodeEditDialogInternal";

type NodeCodeEditDialogProps = {
  editable?: boolean;
  itemLabelFunction: (item: ArenaCategoryItem) => string;
  items?: ArenaCategoryItem[];
  nodeDef: ArenaNodeDefCode;
  onDismiss?: () => void;
  onItemAdd: (uuid: string) => void;
  onItemRemove: (uuid: string) => void;
  onSingleValueChange: (uuid: string | undefined) => void;
  parentNodeUuid?: string;
  selectedItems?: ArenaCategoryItem[];
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
    (selectedItemUuid: string | undefined) => {
      onSingleValueChangeProp?.(selectedItemUuid);
      if (selectedItemUuid) {
        onDismiss?.();
      }
    },
    [onDismiss, onSingleValueChangeProp],
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
