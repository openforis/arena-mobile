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

// @ts-expect-error TS(7030): Not all code paths return a value.
export const NodeCodeComponent = (props: any) => {
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
      // @ts-expect-error TS(2709): Cannot use namespace 'NodeCodeReadOnlyValue' as a ... Remove this comment to see the full error message
      <NodeCodeReadOnlyValue
        nodeDef={nodeDef}
        // @ts-expect-error TS(7027): Unreachable code detected.
        itemLabelFunction={itemLabelFunction}
        // @ts-expect-error TS(2588): Cannot assign to 'selectedItems' because it is a c... Remove this comment to see the full error message
        selectedItems={selectedItems}
      />
    );
  }

  if (
    // @ts-expect-error TS(2304): Cannot find name 'items'.
    items.length > MAX_VISIBLE_ITEMS ||
    // @ts-expect-error TS(2304): Cannot find name 'cycle'.
    NodeDefs.getLayoutRenderType(cycle)(nodeDef) === "dropdown"
  ) {
    // @ts-expect-error TS(2304): Cannot find name 'viewMode'.
    if (viewMode === RecordEditViewMode.form) {
      return (
        <>
          <NodeCodePreview
            itemLabelFunction={itemLabelFunction}
            // @ts-expect-error TS(7027): Unreachable code detected.
            nodeDef={nodeDef}
            // @ts-expect-error TS(2304): Cannot find name 'openEditDialog'.
            openEditDialog={openEditDialog}
            // @ts-expect-error TS(2304): Cannot find name 'openFindClosestSamplingPointDial... Remove this comment to see the full error message
            openFindClosestSamplingPointDialog={
              // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
              openFindClosestSamplingPointDialog
            }
            // @ts-expect-error TS(2304): Cannot find name 'selectedItems'.
            selectedItems={selectedItems}
          />
          // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
          {editDialogOpen && (
            // @ts-expect-error TS(2709): Cannot use namespace 'NodeCodeEditDialog' as a typ... Remove this comment to see the full error message
            <NodeCodeEditDialog
              // @ts-expect-error TS(2304): Cannot find name 'editable'.
              editable={editable}
              // @ts-expect-error TS(2304): Cannot find name 'itemLabelFunction'.
              itemLabelFunction={itemLabelFunction}
              // @ts-expect-error TS(2304): Cannot find name 'items'.
              items={items}
              // @ts-expect-error TS(2304): Cannot find name 'nodeDef'.
              nodeDef={nodeDef}
              // @ts-expect-error TS(2304): Cannot find name 'onDismiss'.
              onDismiss={closeEditDialog}
              // @ts-expect-error TS(2304): Cannot find name 'onItemAdd'.
              onItemAdd={onItemAdd}
              // @ts-expect-error TS(2304): Cannot find name 'onItemRemove'.
              onItemRemove={onItemRemove}
              // @ts-expect-error TS(2304): Cannot find name 'onSingleValueChange'.
              onSingleValueChange={onSingleValueChange}
              // @ts-expect-error TS(2304): Cannot find name 'parentNodeUuid'.
              parentNodeUuid={parentNodeUuid}
              // @ts-expect-error TS(2304): Cannot find name 'selectedItems'.
              selectedItems={selectedItems}
            />
          )}
          // @ts-expect-error TS(2304): Cannot find name 'findClosestSamplingPointDialogOp... Remove this comment to see the full error message
          {findClosestSamplingPointDialogOpen && (
            // @ts-expect-error TS(2709): Cannot use namespace 'NodeCodeFindClosestSamplingP... Remove this comment to see the full error message
            <NodeCodeFindClosestSamplingPointDialog
              // @ts-expect-error TS(2304): Cannot find name 'itemLabelFunction'.
              itemLabelFunction={itemLabelFunction}
              // @ts-expect-error TS(2304): Cannot find name 'items'.
              items={items}
              // @ts-expect-error TS(2304): Cannot find name 'nodeDef'.
              nodeDef={nodeDef}
              // @ts-expect-error TS(2304): Cannot find name 'onDismiss'.
              onDismiss={closeFindClosestSamplingPointDialog}
              // @ts-expect-error TS(2304): Cannot find name 'onItemSelected'.
              onItemSelected={(selectedMinDistanceItem) => {
                // @ts-expect-error TS(2304): Cannot find name 'onSingleValueChange'.
                onSingleValueChange(selectedMinDistanceItem.uuid);
                // @ts-expect-error TS(2304): Cannot find name 'closeFindClosestSamplingPointDia... Remove this comment to see the full error message
                closeFindClosestSamplingPointDialog();
              }}
              // @ts-expect-error TS(2304): Cannot find name 'parentNodeUuid'.
              parentNodeUuid={parentNodeUuid}
            />
          )}
        </>
      );
    }
    return (
      <NodeCodeAutocomplete
        editable={editable}
        // @ts-expect-error TS(7027): Unreachable code detected.
        itemLabelFunction={itemLabelFunction}
        // @ts-expect-error TS(2304): Cannot find name 'items'.
        items={items}
        // @ts-expect-error TS(2304): Cannot find name 'multiple'.
        multiple={multiple}
        // @ts-expect-error TS(2304): Cannot find name 'onItemAdd'.
        onItemAdd={onItemAdd}
        // @ts-expect-error TS(2304): Cannot find name 'onItemRemove'.
        onItemRemove={onItemRemove}
        // @ts-expect-error TS(2304): Cannot find name 'onSingleValueChange'.
        onSingleValueChange={onSingleValueChange}
        // @ts-expect-error TS(2304): Cannot find name 'selectedItems'.
        selectedItems={selectedItems}
      />
    );
  }
  // @ts-expect-error TS(2304): Cannot find name 'multiple'.
  if (multiple) {
    return (
      <NodeCodeMultipleCheckboxComponent
        editable={editable}
        // @ts-expect-error TS(2304): Cannot find name 'itemLabelFunction'.
        itemLabelFunction={itemLabelFunction}
        // @ts-expect-error TS(2304): Cannot find name 'items'.
        items={items}
        // @ts-expect-error TS(2304): Cannot find name 'onItemAdd'.
        onItemAdd={onItemAdd}
        // @ts-expect-error TS(2304): Cannot find name 'onItemRemove'.
        onItemRemove={onItemRemove}
        // @ts-expect-error TS(2304): Cannot find name 'selectedItems'.
        selectedItems={selectedItems}
      />
    );
  }
  return (
    <NodeCodeSingleRadioComponent
      editable={editable}
      // @ts-expect-error TS(2304): Cannot find name 'itemLabelFunction'.
      itemLabelFunction={itemLabelFunction}
      // @ts-expect-error TS(2304): Cannot find name 'items'.
      items={items}
      // @ts-expect-error TS(2304): Cannot find name 'onChange'.
      onChange={onSingleValueChange}
      // @ts-expect-error TS(2304): Cannot find name 'value'.
      value={selectedItemUuid}
    />
  );
};

NodeCodeComponent.propTypes = NodeComponentPropTypes;
