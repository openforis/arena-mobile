import React, { useCallback } from "react";
import PropTypes from "prop-types";

import { SelectableListWithFilter } from "components";

import { SurveySelectors } from "state/survey";

const itemKeyExtractor = (item) => item?.uuid;

export const NodeCodeAutocomplete = (props) => {
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
    (selectedItemsUpdated) => {
      if (multiple) {
        const newItem = selectedItemsUpdated.find(
          (item) => !selectedItems.includes(item)
        );
        const removedItem = selectedItems.find(
          (item) => !selectedItemsUpdated.includes(item)
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
    (item) => item?.props?.descriptions?.[lang],
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
