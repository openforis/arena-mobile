import React, { useCallback } from "react";

import { Checkbox, HView } from "components";

import styles from "./styles";

type NodeCodeMultipleCheckboxComponentProps = {
  editable?: boolean;
  itemLabelFunction: (item: any) => string;
  items: any[];
  onItemAdd: (uuid: string) => void;
  onItemRemove: (uuid: string) => void;
  selectedItems?: any[];
};

export const NodeCodeMultipleCheckboxComponent = (
  props: NodeCodeMultipleCheckboxComponentProps
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
    (item: any) => {
      const wasSelected = selectedItems.includes(item);
      if (wasSelected) {
        onItemRemove(item.uuid);
      } else {
        onItemAdd(item.uuid);
      }
    },
    [onItemAdd, onItemRemove, selectedItems]
  );

  return (
    <HView style={styles.container}>
      {items.map((item: any) => (
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
