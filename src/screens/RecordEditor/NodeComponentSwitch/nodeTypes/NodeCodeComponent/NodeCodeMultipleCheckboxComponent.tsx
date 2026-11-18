import React, { useCallback } from "react";

import { CategoryItem } from "@openforis/arena-core";

import { Checkbox, HView } from "components";

import styles from "./styles";

type NodeCodeMultipleCheckboxComponentProps = {
  editable?: boolean;
  itemLabelFunction: (item: CategoryItem) => string;
  items: CategoryItem[];
  onItemAdd: (uuid: string) => void;
  onItemRemove: (uuid: string) => void;
  selectedItems?: CategoryItem[];
};

export const NodeCodeMultipleCheckboxComponent = (
  props: NodeCodeMultipleCheckboxComponentProps,
) => {
  const {
    editable,
    itemLabelFunction,
    items,
    onItemAdd,
    onItemRemove,
    selectedItems = [],
  } = props;

  const onItemSelect = useCallback(
    (item: CategoryItem) => {
      const wasSelected = selectedItems.includes(item);
      if (wasSelected) {
        onItemRemove(item.uuid);
      } else {
        onItemAdd(item.uuid);
      }
    },
    [onItemAdd, onItemRemove, selectedItems],
  );

  return (
    <HView style={styles.container}>
      {items.map((item) => (
        <Checkbox
          key={item.uuid}
          label={itemLabelFunction(item)}
          labelIsI18nKey={false}
          disabled={!editable}
          checked={selectedItems.includes(item)}
          onPress={() => onItemSelect(item)}
          style={styles.item}
        />
      ))}
    </HView>
  );
};
