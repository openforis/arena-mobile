import { memo, useCallback } from "react";
import { FlatList, StyleProp, ViewStyle } from "react-native";
import { List as RNPList } from "react-native-paper";

import { Arrays } from "@openforis/arena-core";

import { useStableCallback } from "hooks/useStableCallback";
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

type SelectableListItemProps = ListItemIconProps & {
  description: string | null;
  title: string | null;
};

const SelectableListItem = memo(function SelectableListItem(
  props: SelectableListItemProps,
) {
  const {
    checked,
    description,
    editable,
    item,
    multiple,
    onItemSelect,
    title,
  } = props;

  const onPress = useCallback(() => onItemSelect(item), [item, onItemSelect]);

  const renderLeft = useCallback(
    () => (
      <ListItemIcon
        multiple={multiple}
        checked={checked}
        editable={editable}
        onItemSelect={onItemSelect}
        item={item}
      />
    ),
    [checked, editable, item, multiple, onItemSelect],
  );

  return (
    <RNPList.Item
      disabled={!editable}
      title={title}
      description={description}
      left={renderLeft}
      onPress={onPress}
      removeClippedSubviews
      style={styles.item}
    />
  );
});

const nullExtractor = () => null;
const noSelectedItems: any[] = [];

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
    itemLabelExtractor = nullExtractor,
    itemDescriptionExtractor = nullExtractor,
    items,
    multiple = false,
    onChange,
    selectedItems = noSelectedItems,
    style,
  } = props;

  log.debug(`rendering SelectableList`);

  // stable: items re-render only when their own props change
  const onItemSelect = useStableCallback((item: any) => {
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
  });

  const renderItem = useCallback(
    ({ item }: any) => (
      <SelectableListItem
        checked={selectedItems.includes(item)}
        description={itemDescriptionExtractor(item)}
        editable={editable}
        item={item}
        multiple={multiple}
        onItemSelect={onItemSelect}
        title={itemLabelExtractor(item)}
      />
    ),
    [
      editable,
      itemDescriptionExtractor,
      itemLabelExtractor,
      multiple,
      onItemSelect,
      selectedItems,
    ],
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
