import { useCallback, useMemo, useState } from "react";

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

const noItems: any[] = [];

const _objToArray = (obj: any) => {
  if (!obj) return [];
  if (Array.isArray(obj)) return obj;
  return [obj];
};

type Props = SelectableListProps & {
  filterItems?: (params: {
    items: any[];
    filterInputValue: string | null;
  }) => any[];
  itemsCountToShowFilter?: number;
  maxItemsToShow?: number;
  onSelectedItemsChange: (items: any[], filterValue?: string | null) => void;
};

export const SelectableListWithFilter = (props: Props) => {
  const {
    editable = true,
    filterItems,
    itemKeyExtractor = (item: any) => item?.key,
    itemLabelExtractor = (item: any) => item?.label,
    itemDescriptionExtractor = (item: any) => item?.description,
    items = [],
    itemsCountToShowFilter = 10,
    maxItemsToShow = 1000,
    multiple = false,
    onSelectedItemsChange,
    selectedItems = [],
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
  const loading = debounceFiltering && filterInputValue !== filterValue;

  const itemsFilteredNext = useMemo(() => {
    if (!filterVisible) return items;

    if (Objects.isEmpty(filterValue)) {
      if (selectedItems.length === 0) {
        return items.slice(0, maxItemsToShow);
      } else {
        return items
          .filter((item: any) => !selectedItems.includes(item))
          .slice(0, maxItemsToShow);
      }
    }
    if (filterItems) {
      return filterItems({ items, filterInputValue: filterValue });
    }
    return items.filter(
      (item: any) =>
        !selectedItems.includes(item) &&
        itemLabelExtractor(item)
          .toLocaleLowerCase()
          .includes(filterValue!.toLocaleLowerCase()),
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
    (selectedItemsNext: any) => {
      onSelectedItemsChange(selectedItemsNext, filterInputValue);
    },
    [filterInputValue, onSelectedItemsChange],
  );

  const onListSelectionChange = useCallback(
    (newValue: any) => {
      _onSelectedItemsChange(_objToArray(newValue));
    },
    [_onSelectedItemsChange],
  );

  const onItemRemove = useCallback(
    (item: any) => {
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
                {selectedItems.map((item: any) => (
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
