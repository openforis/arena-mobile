import React, { useCallback } from "react";
import PropTypes from "prop-types";

import { NodeDefs } from "@openforis/arena-core";

import { NodeCodeAutocomplete } from "./NodeCodeAutocomplete";
import { NodeEditDialogInternal } from "../NodeEditDialogInternal";

export const NodeCodeEditDialog = (props) => {
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
    (selectedItemUuid) => {
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

NodeCodeEditDialog.propTypes = {
  editable: PropTypes.bool,
  itemLabelFunction: PropTypes.func.isRequired,
  items: PropTypes.array,
  nodeDef: PropTypes.object,
  onDismiss: PropTypes.func,
  onItemAdd: PropTypes.func.isRequired,
  onItemRemove: PropTypes.func.isRequired,
  onSingleValueChange: PropTypes.func.isRequired,
  parentNodeUuid: PropTypes.string,
  selectedItems: PropTypes.array,
};
