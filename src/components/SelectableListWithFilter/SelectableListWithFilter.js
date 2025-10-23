import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chip } from "react-native-paper";
import PropTypes from "prop-types";

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

const _objToArray = (obj) => {
  if (!obj) return [];
  if (Array.isArray(obj)) return obj;
  return [obj];
};

export const SelectableListWithFilter = (props) => {
  const {
    editable = true,
    filterItems,
    itemKeyExtractor = (item) => item?.key,
    itemLabelExtractor = (item) => item?.label,
    itemDescriptionExtractor = (item) => item?.description,
    items = [],
    itemsCountToShowFilter = 10,
    maxItemsToShow = 1000,
    multiple = false,
    onSelectedItemsChange,
    selectedItems = [],
  } = props;

  const inputValueRef = useRef(null);

  const filterVisible = items.length > itemsCountToShowFilter;
  const debounceFiltering = items.length > maxItemsToShow;

  const calculateItemsFiltered = useCallback(() => {
    if (!filterVisible) return items;

    const filterInputValue = inputValueRef.current;

    if (Objects.isEmpty(filterInputValue)) {
      if (selectedItems.length === 0) {
        return items.slice(0, maxItemsToShow);
      } else {
        return items
          .filter((item) => !selectedItems.includes(item))
          .slice(0, maxItemsToShow);
      }
    }
    if (filterItems) {
      return filterItems({ items, filterInputValue });
    }
    return items.filter(
      (item) =>
        !selectedItems.includes(item) &&
        (Objects.isEmpty(filterInputValue) ||
          itemLabelExtractor(item)
            .toLocaleLowerCase()
            .includes(filterInputValue.toLocaleLowerCase()))
    );
  }, [
    filterItems,
    filterVisible,
    itemLabelExtractor,
    items,
    maxItemsToShow,
    selectedItems,
  ]);

  const [state, setState] = useState({
    loading: false,
    itemsFiltered: calculateItemsFiltered(),
  });
  const { loading, itemsFiltered } = state;

  const updateItemsFiltered = useCallback(() => {
    const itemsFilteredNext = calculateItemsFiltered();
    setState((statePrev) => {
      const { itemsFiltered } = statePrev;
      if (!Objects.isEqual(itemsFiltered, itemsFilteredNext)) {
        return {
          ...statePrev,
          loading: false,
          itemsFiltered: itemsFilteredNext,
        };
      }
      return debounceFiltering ? { ...statePrev, loading: false } : statePrev;
    });
  }, [calculateItemsFiltered, debounceFiltering]);

  const updateItemsFilteredDebouced = useMemo(
    () => Functions.debounce(updateItemsFiltered, 500),
    [updateItemsFiltered]
  );

  const onFilterInputChange = useCallback(
    (text) => {
      inputValueRef.current = text;
      if (debounceFiltering) {
        if (!loading) {
          setState((statePrev) => ({
            ...statePrev,
            loading: true,
            itemsFiltered: [],
          }));
        }
        updateItemsFilteredDebouced();
      } else {
        updateItemsFiltered();
      }
    },
    [
      debounceFiltering,
      loading,
      updateItemsFiltered,
      updateItemsFilteredDebouced,
    ]
  );

  const _onSelectedItemsChange = useCallback(
    (selectedItemsNext) => {
      onSelectedItemsChange(selectedItemsNext, inputValueRef.current);
    },
    [onSelectedItemsChange]
  );

  const onListSelectionChange = useCallback(
    (newValue) => {
      _onSelectedItemsChange(_objToArray(newValue));
    },
    [_onSelectedItemsChange]
  );

  const onItemRemove = useCallback(
    (item) => {
      _onSelectedItemsChange(Arrays.removeItem(item)(selectedItems));
    },
    [_onSelectedItemsChange, selectedItems]
  );

  useEffect(() => {
    updateItemsFiltered();
  }, [updateItemsFiltered, items, selectedItems]);

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

SelectableListWithFilter.propTypes = {
  editable: PropTypes.bool,
  filterItems: PropTypes.func,
  itemKeyExtractor: PropTypes.func,
  itemLabelExtractor: PropTypes.func,
  itemDescriptionExtractor: PropTypes.func,
  items: PropTypes.array,
  itemsCountToShowFilter: PropTypes.number,
  maxItemsToShow: PropTypes.number,
  multiple: PropTypes.bool,
  onSelectedItemsChange: PropTypes.func.isRequired,
  selectedItems: PropTypes.array,
};
