import React, { useCallback } from "react";
import { FlatList, StyleProp, ViewStyle } from "react-native";
import { List as RNPList } from "react-native-paper";

import { Arrays } from "@openforis/arena-core";

import { log } from "utils";
import { Checkbox } from "../Checkbox";
import { RadioButton } from "../RadioButton";

import styles from "./styles";

type ListItemIconProps = {
  multiple: boolean;
  checked: boolean;
  editable: boolean;
  onItemSelect: (item: any) => void;
  item: any;
};

const ListItemIcon = (props: ListItemIconProps) => {
  const { multiple, checked, editable, onItemSelect, item } = props;

  const onPress = useCallback(() => onItemSelect(item), [item, onItemSelect]);

  return multiple ? (
    <Checkbox checked={checked} disabled={!editable} onPress={onPress} />
  ) : (
    <RadioButton checked={checked} disabled={!editable} onPress={onPress} />
  );
};

export type SelectableListProps = {
  editable?: boolean;
  itemKeyExtractor?: (item: any) => string;
  itemLabelExtractor?: (item: any) => string;
  itemDescriptionExtractor?: (item: any) => string;
  items: any[];
  multiple?: boolean;
  onChange?: (items: any[]) => void;
  selectedItems?: any[];
  style?: StyleProp<ViewStyle>;
};

export const SelectableList = (props: SelectableListProps) => {
  const {
    editable = true,
    itemKeyExtractor,
    itemLabelExtractor = () => null,
    itemDescriptionExtractor = () => null,
    items,
    multiple = false,
    onChange,
    selectedItems = [],
    style,
  } = props;

  log.debug(`rendering SelectableList`);

  const onItemSelect = useCallback(
    (item: any) => {
      if (!onChange) return;

      const wasSelected = selectedItems.includes(item);
      let selectedItemsNext;
      if (multiple) {
        selectedItemsNext = wasSelected
          ? Arrays.removeItem(item)(selectedItems)
          : Arrays.addItem(item)(selectedItems);
      } else {
        selectedItemsNext = wasSelected ? [] : [item];
      }
      onChange(selectedItemsNext);
    },
    [multiple, onChange, selectedItems]
  );

  const renderItem = useCallback(
    ({ item }: any) => (
      <RNPList.Item
        disabled={!editable}
        title={itemLabelExtractor(item)}
        description={itemDescriptionExtractor(item)}
        left={() => (
          <ListItemIcon
            multiple={multiple}
            checked={selectedItems.includes(item)}
            editable={editable}
            onItemSelect={onItemSelect}
            item={item}
          />
        )}
        onPress={() => onItemSelect(item)}
        removeClippedSubviews
        style={styles.item}
      />
    ),
    [
      editable,
      itemDescriptionExtractor,
      itemLabelExtractor,
      multiple,
      onItemSelect,
      selectedItems,
    ]
  );

  return (
    <FlatList
      data={items}
      keyExtractor={itemKeyExtractor}
      persistentScrollbar
      renderItem={renderItem}
      style={style}
    />
  );
};
