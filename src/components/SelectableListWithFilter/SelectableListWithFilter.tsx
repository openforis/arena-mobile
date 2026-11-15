import { useCallback, useEffect, useMemo, useState } from "react";

import { Chip } from "react-native-paper";

import { Arrays, Objects } from "@openforis/arena-core";

import { Functions } from "utils";
import { IconButton } from "../IconButton";
import { LoadingIcon } from "../LoadingIcon";
import { ScrollView } from "../ScrollView";
import { Searchbar } from "../Searchbar";
import { Text } from "../Text";
import { VView } from "../VView";
import { View } from "../View";

import { SelectableList } from "../SelectableList";

import styles from "./styles";
import { SelectableListProps } from "components/SelectableList/SelectableList";

const noItems: never[] = [];

// used when the items have this shape and no extractors are specified
type DefaultItem = { key: string; label: string; description?: string | null };

const defaultItemKeyExtractor = (item: unknown) => (item as DefaultItem)?.key;
const defaultItemLabelExtractor = (item: unknown) =>
  (item as DefaultItem)?.label;
const defaultItemDescriptionExtractor = (item: unknown) =>
  (item as DefaultItem)?.description;

const _objToArray = <T,>(obj: T | T[] | null | undefined): T[] => {
  if (!obj) return [];
  if (Array.isArray(obj)) return obj;
  return [obj];
};

type Props<T> = SelectableListProps<T> & {
  filterItems?: (params: {
    items: T[];
    filterInputValue: string | null;
  }) => T[];
  itemsCountToShowFilter?: number;
  maxItemsToShow?: number;
  onSelectedItemsChange: (items: T[], filterValue?: string | null) => void;
};

export const SelectableListWithFilter = <T,>(props: Props<T>) => {
  const {
    editable = true,
    filterItems,
    itemKeyExtractor = defaultItemKeyExtractor,
    itemLabelExtractor = defaultItemLabelExtractor,
    itemDescriptionExtractor = defaultItemDescriptionExtractor,
    items = noItems,
    itemsCountToShowFilter = 10,
    maxItemsToShow = 1000,
    multiple = false,
    onSelectedItemsChange,
    selectedItems = noItems,
  } = props;

  const filterVisible = items.length > itemsCountToShowFilter;
  const debounceFiltering = items.length > maxItemsToShow;

  const [filterInputValue, setFilterInputValue] = useState<string | null>(null);
  // the value the items are filtered with (debounced when there are many items)
  const [filterValue, setFilterValue] = useState<string | null>(null);
  const setFilterValueDebounced = useMemo(
    () => Functions.debounce(setFilterValue, 500),
    [],
  );
  useEffect(
    () => () => setFilterValueDebounced.cancel(),
    [setFilterValueDebounced],
  );
  const loading = debounceFiltering && filterInputValue !== filterValue;

  const itemsFilteredNext = useMemo(() => {
    if (!filterVisible) return items;

    if (Objects.isEmpty(filterValue)) {
      if (selectedItems.length === 0) {
        return items.slice(0, maxItemsToShow);
      } else {
        return items
          .filter((item) => !selectedItems.includes(item))
          .slice(0, maxItemsToShow);
      }
    }
    if (filterItems) {
      return filterItems({ items, filterInputValue: filterValue });
    }
    const filterValueLowerCase = filterValue!.toLocaleLowerCase();
    return items.filter(
      (item) =>
        !selectedItems.includes(item) &&
        itemLabelExtractor(item)
          .toLocaleLowerCase()
          .includes(filterValueLowerCase),
    );
  }, [
    filterItems,
    filterValue,
    filterVisible,
    itemLabelExtractor,
    items,
    maxItemsToShow,
    selectedItems,
  ]);

  // same array while the filtered items don't change (callers can pass new arrays on every render): the list is not re-rendered
  const [itemsFilteredState, setItemsFilteredState] = useState({
    source: itemsFilteredNext,
    items: itemsFilteredNext,
  });
  if (itemsFilteredState.source !== itemsFilteredNext) {
    setItemsFilteredState({
      source: itemsFilteredNext,
      items: Objects.isEqual(itemsFilteredState.items, itemsFilteredNext)
        ? itemsFilteredState.items
        : itemsFilteredNext,
    });
  }
  const itemsFiltered = loading ? noItems : itemsFilteredState.items;

  const onFilterInputChange = useCallback(
    (text: string) => {
      setFilterInputValue(text);
      if (debounceFiltering) {
        setFilterValueDebounced(text);
      } else {
        setFilterValue(text);
      }
    },
    [debounceFiltering, setFilterValueDebounced],
  );

  const _onSelectedItemsChange = useCallback(
    (selectedItemsNext: T[]) => {
      onSelectedItemsChange(selectedItemsNext, filterInputValue);
    },
    [filterInputValue, onSelectedItemsChange],
  );

  const onListSelectionChange = useCallback(
    (newValue: T[]) => {
      _onSelectedItemsChange(_objToArray(newValue));
    },
    [_onSelectedItemsChange],
  );

  const onItemRemove = useCallback(
    (item: T) => {
      _onSelectedItemsChange(Arrays.removeItem(item)(selectedItems));
    },
    [_onSelectedItemsChange, selectedItems],
  );

  const onClearPress = useCallback(() => {
    _onSelectedItemsChange([]);
  }, [_onSelectedItemsChange]);

  return (
    <VView style={styles.container}>
      {filterVisible && (
        <>
          {selectedItems.length > 0 && (
            <ScrollView
              persistentScrollbar
              style={
                multiple
                  ? styles.selectedItemsContainerWrapper
                  : styles.selectedItemContainerWrapper
              }
            >
              <View style={styles.selectedItemsContainer}>
                {selectedItems.map((item) => (
                  <Chip
                    key={itemKeyExtractor(item)}
                    onClose={() => onItemRemove(item)}
                  >
                    {itemLabelExtractor(item)}
                  </Chip>
                ))}
              </View>
            </ScrollView>
          )}
          {(multiple || selectedItems.length === 0) && (
            <Text
              variant="titleMedium"
              textKey={
                multiple ? "common:selectNewItems" : "common:selectAnItem"
              }
            />
          )}
          <Searchbar onChange={onFilterInputChange} />

          {loading && <LoadingIcon />}

          {!loading && itemsFiltered.length === 0 && (
            <Text
              variant="titleMedium"
              textKey="common:noItemsMatchingSearch"
            />
          )}
        </>
      )}

      <SelectableList
        editable={editable}
        itemKeyExtractor={itemKeyExtractor}
        itemLabelExtractor={itemLabelExtractor}
        itemDescriptionExtractor={itemDescriptionExtractor}
        items={itemsFiltered}
        multiple={multiple}
        onChange={onListSelectionChange}
        selectedItems={selectedItems}
        style={styles.list}
      />

      {!filterVisible && (
        <IconButton
          icon="delete"
          onPress={onClearPress}
          style={styles.clearButton}
        />
      )}
    </VView>
  );
};
