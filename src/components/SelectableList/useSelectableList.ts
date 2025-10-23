import { useCallback, useEffect, useState } from "react";

import { Arrays } from "@openforis/arena-core";

const initialState = {
  selectionEnabled: false,
  selectedItemIds: [],
};

export const useSelectableList = (props) => {
  const {
    items,
    onItemPress: onItemPressProp,
    onItemLongPress: onItemLongPressProp,
    onSelectionChange,
    onDeleteSelectedItemIds,
    selectable,
    selectedItemIds: selectedItemIdsProp,
  } = props;

  const [state, setState] = useState({
    ...initialState,
    selectedItemIds: selectedItemIdsProp ?? [],
  });

  const { selectedItemIds, selectionEnabled } = state;

  // reset state on items change
  useEffect(() => {
    setState((statePrev) => ({ ...statePrev, ...initialState }));
    onSelectionChange?.([]);
  }, [items, onSelectionChange, selectable]);

  // update internal selected item ids on prop change
  useEffect(() => {
    if (
      selectedItemIds === selectedItemIdsProp ||
      (selectedItemIds?.length === 0 && selectedItemIdsProp?.length === 0)
    ) {
      return;
    }
    const selectedItemIdsNext = selectedItemIdsProp ?? selectedItemIds;
    const selectionEnabledNext = selectedItemIdsNext?.length > 0;

    setState((statePrev) => ({
      ...statePrev,
      selectedItemIds: selectedItemIdsNext,
      selectionEnabled: selectionEnabledNext,
    }));
  }, [selectedItemIds, selectedItemIdsProp]);

  const onItemSelect = useCallback(
    (item) => {
      const { key } = item;
      const selected = !selectedItemIds.includes(key);
      const selectedItemIdsNext = selected
        ? Arrays.addItem(key)(selectedItemIds)
        : Arrays.removeItem(key)(selectedItemIds);

      setState((statePrev) => ({
        ...statePrev,
        selectionEnabled: selectedItemIdsNext.length > 0,
        selectedItemIds: selectedItemIdsNext,
      }));

      onSelectionChange?.(selectedItemIdsNext);
    },
    [onSelectionChange, selectedItemIds]
  );

  const onDeleteSelected = useCallback(() => {
    const performDelete = () => {
      onSelectionChange?.([]);
      setState((statePrev) => ({ ...statePrev, ...initialState }));
    };
    if (onDeleteSelectedItemIds) {
      onDeleteSelectedItemIds(selectedItemIds)
        ?.then(performDelete)
        ?.catch(() => {
          // ignore it
        });
    } else {
      performDelete();
    }
  }, [selectedItemIds, onDeleteSelectedItemIds, onSelectionChange]);

  const onItemPress = useCallback(
    (item) => {
      if (selectionEnabled) {
        onItemSelect(item);
      } else {
        onItemPressProp?.(item);
      }
    },
    [onItemPressProp, onItemSelect, selectionEnabled]
  );

  const onItemLongPress = useCallback(
    (item) => {
      if (selectable) {
        onItemSelect(item);
      } else {
        onItemLongPressProp?.(item);
      }
    },
    [onItemLongPressProp, onItemSelect, selectable]
  );

  return {
    onDeleteSelected,
    onItemLongPress,
    onItemPress,
    onItemSelect,
    selectedItemIds,
    selectionEnabled,
  };
};
