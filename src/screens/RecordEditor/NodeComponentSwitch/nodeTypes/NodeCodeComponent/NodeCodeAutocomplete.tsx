import React, { useCallback } from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { SelectableListWithFilter } from "components";

import { SurveySelectors } from "state/survey";

const itemKeyExtractor = (item: any) => item?.uuid;

export const NodeCodeAutocomplete = (props: any) => {
  const {
    editable = true,
    itemLabelFunction,
    items = [],
    multiple = false,
    onItemAdd,
    onItemRemove,
    onSingleValueChange,
    selectedItems = [],
  } = props;

  const lang = SurveySelectors.useCurrentSurveyPreferredLang();

  const onSelectedItemsChange = useCallback(
    (selectedItemsUpdated: any) => {
      if (multiple) {
        const newItem = selectedItemsUpdated.find(
          (item: any) => !selectedItems.includes(item)
        );
        const removedItem = selectedItems.find(
          (item: any) => !selectedItemsUpdated.includes(item)
        );
        if (removedItem) {
          onItemRemove(removedItem.uuid);
        }
        if (newItem) {
          onItemAdd(newItem.uuid);
        }
      } else {
        const selectedItem = selectedItemsUpdated[0];
        onSingleValueChange(selectedItem?.uuid);
      }
    },
    [onItemAdd, onItemRemove, onSingleValueChange, selectedItems, multiple]
  );

  const itemDescriptionExtractor = useCallback(
    (item: any) => item?.props?.descriptions?.[lang],
    [lang]
  );

  return (
    <SelectableListWithFilter
      editable={editable}
      itemKeyExtractor={itemKeyExtractor}
      itemLabelExtractor={itemLabelFunction}
      itemDescriptionExtractor={itemDescriptionExtractor}
      items={items}
      multiple={multiple}
      onSelectedItemsChange={onSelectedItemsChange}
      selectedItems={selectedItems}
    />
  );
};

NodeCodeAutocomplete.propTypes = {
  editable: PropTypes.bool,
  itemLabelFunction: PropTypes.func.isRequired,
  items: PropTypes.array,
  multiple: PropTypes.bool,
  onItemAdd: PropTypes.func.isRequired,
  onItemRemove: PropTypes.func.isRequired,
  onSingleValueChange: PropTypes.func.isRequired,
  selectedItems: PropTypes.array,
};
