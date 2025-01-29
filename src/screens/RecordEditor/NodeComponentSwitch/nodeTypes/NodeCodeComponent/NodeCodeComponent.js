import { NodeDefs } from "@openforis/arena-core";

import {
  DataEntrySelectors,
  SurveyOptionsSelectors,
  SurveySelectors,
} from "state";

import { RecordEditViewMode } from "model/RecordEditViewMode";

import { useNodeCodeComponentLocalState } from "./useNodeCodeComponentLocalState";
import { NodeCodeSingleRadioComponent } from "./NodeCodeSingleRadioComponent";
import { NodeCodeMultipleCheckboxComponent } from "./NodeCodeMultipleCheckboxComponent";
import { NodeCodeReadOnlyValue } from "./NodeCodeReadOnlyValue";
import { NodeCodeEditDialog } from "./NodeCodeEditDialog";
import { NodeCodePreview } from "./NodeCodePreview";
import { NodeCodeAutocomplete } from "./NodeCodeAutocomplete";
import { NodeCodeFindClosestSamplingPointDialog } from "./NodeCodeFindClosestSamplingPointDialog";
import { NodeComponentPropTypes } from "../nodeComponentPropTypes";

const MAX_VISIBLE_ITEMS = 10;

export const NodeCodeComponent = (props) => {
  const { parentNodeUuid, nodeDef } = props;

  if (__DEV__) {
    console.log(`rendering NodeCodeComponent for ${NodeDefs.getName(nodeDef)}`);
  }

  const {
    closeEditDialog,
    closeFindClosestSamplingPointDialog,
    editDialogOpen,
    findClosestSamplingPointDialogOpen,
    itemLabelFunction,
    items,
    onItemAdd,
    onItemRemove,
    onSingleValueChange,
    openEditDialog,
    openFindClosestSamplingPointDialog,
    selectedItems,
    selectedItemUuid,
  } = useNodeCodeComponentLocalState({
    parentNodeUuid,
    nodeDef,
  });

  const cycle = DataEntrySelectors.useRecordCycle();
  const isNodeDefEnumerator = SurveySelectors.useIsNodeDefEnumerator(nodeDef);
  const viewMode = SurveyOptionsSelectors.useRecordEditViewMode();

  const editable = !NodeDefs.isReadOnly(nodeDef) && !isNodeDefEnumerator;
  const multiple = NodeDefs.isMultiple(nodeDef);

  if (!editable) {
    return (
      <NodeCodeReadOnlyValue
        nodeDef={nodeDef}
        itemLabelFunction={itemLabelFunction}
        selectedItems={selectedItems}
      />
    );
  }

  if (
    items.length > MAX_VISIBLE_ITEMS ||
    NodeDefs.getLayoutRenderType(cycle)(nodeDef) === "dropdown"
  ) {
    if (viewMode === RecordEditViewMode.form) {
      return (
        <>
          <NodeCodePreview
            itemLabelFunction={itemLabelFunction}
            nodeDef={nodeDef}
            openEditDialog={openEditDialog}
            openFindClosestSamplingPointDialog={
              openFindClosestSamplingPointDialog
            }
            selectedItems={selectedItems}
          />
          {editDialogOpen && (
            <NodeCodeEditDialog
              editable={editable}
              itemLabelFunction={itemLabelFunction}
              items={items}
              nodeDef={nodeDef}
              onDismiss={closeEditDialog}
              onItemAdd={onItemAdd}
              onItemRemove={onItemRemove}
              onSingleValueChange={onSingleValueChange}
              parentNodeUuid={parentNodeUuid}
              selectedItems={selectedItems}
            />
          )}
          {findClosestSamplingPointDialogOpen && (
            <NodeCodeFindClosestSamplingPointDialog
              itemLabelFunction={itemLabelFunction}
              items={items}
              nodeDef={nodeDef}
              onDismiss={closeFindClosestSamplingPointDialog}
              onItemSelected={(selectedMinDistanceItem) => {
                onSingleValueChange(selectedMinDistanceItem.uuid);
                closeFindClosestSamplingPointDialog();
              }}
              parentNodeUuid={parentNodeUuid}
            />
          )}
        </>
      );
    }
    return (
      <NodeCodeAutocomplete
        editable={editable}
        itemLabelFunction={itemLabelFunction}
        items={items}
        multiple={multiple}
        onItemAdd={onItemAdd}
        onItemRemove={onItemRemove}
        onSingleValueChange={onSingleValueChange}
        selectedItems={selectedItems}
      />
    );
  }
  if (multiple) {
    return (
      <NodeCodeMultipleCheckboxComponent
        editable={editable}
        itemLabelFunction={itemLabelFunction}
        items={items}
        onItemAdd={onItemAdd}
        onItemRemove={onItemRemove}
        selectedItems={selectedItems}
      />
    );
  }
  return (
    <NodeCodeSingleRadioComponent
      editable={editable}
      itemLabelFunction={itemLabelFunction}
      items={items}
      onChange={onSingleValueChange}
      value={selectedItemUuid}
    />
  );
};

NodeCodeComponent.propTypes = NodeComponentPropTypes;
