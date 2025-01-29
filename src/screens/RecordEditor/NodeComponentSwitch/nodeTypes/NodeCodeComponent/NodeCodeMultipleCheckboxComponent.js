import React, { useCallback } from "react";
import PropTypes from "prop-types";

import { Checkbox, HView } from "components";

import styles from "./styles";

export const NodeCodeMultipleCheckboxComponent = (props) => {
  const {
    editable,
    itemLabelFunction,
    items,
    onItemAdd,
    onItemRemove,
    selectedItems,
  } = props;

  const onItemSelect = useCallback(
    (item) => {
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
      {items.map((item) => (
        <Checkbox
          key={item.uuid}
          label={itemLabelFunction(item)}
          disabled={!editable}
          checked={selectedItems.includes(item)}
          onPress={() => onItemSelect(item)}
          style={styles.item}
        />
      ))}
    </HView>
  );
};

NodeCodeMultipleCheckboxComponent.propTypes = {
  editable: PropTypes.bool,
  itemLabelFunction: PropTypes.func,
  items: PropTypes.array,
  onItemAdd: PropTypes.func,
  onItemRemove: PropTypes.func,
  selectedItems: PropTypes.array,
};
