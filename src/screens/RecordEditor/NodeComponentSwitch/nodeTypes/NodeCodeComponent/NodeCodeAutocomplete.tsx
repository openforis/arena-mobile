import React, { useCallback } from "react";

import { ArenaCategoryItem, ArenaLabels } from "@openforis/arena-core";

import { SelectableListWithFilter } from "components";

import { SurveySelectors } from "state/survey";

// descriptions are not declared in arena-core CategoryItemProps
type CategoryItemWithDescriptions = ArenaCategoryItem & {
  props: { descriptions?: ArenaLabels };
};

const itemKeyExtractor = (item: ArenaCategoryItem) => item?.uuid;

type NodeCodeAutocompleteProps = {
  editable?: boolean;
  itemLabelFunction: (item: ArenaCategoryItem) => string;
  items?: ArenaCategoryItem[];
  multiple?: boolean;
  onItemAdd: (uuid: string) => void;
  onItemRemove: (uuid: string) => void;
  onSingleValueChange: (uuid: string | undefined) => void;
  selectedItems?: ArenaCategoryItem[];
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
    (selectedItemsUpdated: ArenaCategoryItem[]) => {
      if (multiple) {
        const newItem = selectedItemsUpdated.find(
          (item) => !selectedItems.includes(item),
        );
        const removedItem = selectedItems.find(
          (item) => !selectedItemsUpdated.includes(item),
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
    [onItemAdd, onItemRemove, onSingleValueChange, selectedItems, multiple],
  );

  const itemDescriptionExtractor = useCallback(
    (item: CategoryItemWithDescriptions | undefined) =>
      item?.props?.descriptions?.[lang],
    [lang],
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
