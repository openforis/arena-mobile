import React, { useCallback } from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { Checkbox, HView } from "components";

import styles from "./styles";

export const NodeCodeMultipleCheckboxComponent = (props: any) => {
  const {
    editable,
    itemLabelFunction,
    items,
    onItemAdd,
    onItemRemove,
    selectedItems,
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
      {items.map((item: any) => <Checkbox
        key={item.uuid}
        label={itemLabelFunction(item)}
        disabled={!editable}
        checked={selectedItems.includes(item)}
        onPress={() => onItemSelect(item)}
        style={styles.item}
      />)}
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
