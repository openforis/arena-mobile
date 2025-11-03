import React, { useCallback } from "react";

import { SelectableListWithFilter } from "components";

import { SurveySelectors } from "state/survey";

const itemKeyExtractor = (item: any) => item?.uuid;

type NodeCodeAutocompleteProps = {
  editable?: boolean;
  itemLabelFunction: (item: any) => string;
  items?: any[];
  multiple?: boolean;
  onItemAdd: (uuid: string) => void;
  onItemRemove: (uuid: string) => void;
  onSingleValueChange: (uuid: string) => void;
  selectedItems?: any[];
};

export const NodeCodeAutocomplete = (props: NodeCodeAutocompleteProps) => {
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
