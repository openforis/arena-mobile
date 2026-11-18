import { memo, useCallback } from "react";
import { FlatList, StyleProp, ViewStyle } from "react-native";
import { List as RNPList } from "react-native-paper";

import { Arrays } from "@openforis/arena-core";

import { useStableCallback } from "hooks/useStableCallback";
import { log } from "utils";
import { Checkbox } from "../Checkbox";
import { RadioButton } from "../RadioButton";

import styles from "./styles";

type ListItemIconProps<T> = {
  multiple: boolean;
  checked: boolean;
  editable: boolean;
  onItemSelect: (item: T) => void;
  item: T;
};

const ListItemIcon = <T,>(props: ListItemIconProps<T>) => {
  const { multiple, checked, editable, onItemSelect, item } = props;

  const onPress = useCallback(() => onItemSelect(item), [item, onItemSelect]);

  return multiple ? (
    <Checkbox checked={checked} disabled={!editable} onPress={onPress} />
  ) : (
    <RadioButton checked={checked} disabled={!editable} onPress={onPress} />
  );
};

type SelectableListItemProps<T> = ListItemIconProps<T> & {
  description?: string | null;
  title: string | null;
};

const SelectableListItem = memo(function SelectableListItem<T>(
  props: SelectableListItemProps<T>,
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
}) as <T>(props: SelectableListItemProps<T>) => React.ReactElement;

const nullExtractor = () => null;
const noSelectedItems: never[] = [];

export type SelectableListProps<T> = {
  editable?: boolean;
  itemKeyExtractor?: (item: T) => string;
  itemLabelExtractor?: (item: T) => string;
  itemDescriptionExtractor?: (item: T) => string | null | undefined;
  items: T[];
  multiple?: boolean;
  onChange?: (items: T[]) => void;
  selectedItems?: T[];
  style?: StyleProp<ViewStyle>;
};

export const SelectableList = <T,>(props: SelectableListProps<T>) => {
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
  const onItemSelect = useStableCallback((item: T) => {
    if (!onChange) return;

    const wasSelected = selectedItems.includes(item);
    let selectedItemsNext: T[];
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
    ({ item }: { item: T }) => (
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
