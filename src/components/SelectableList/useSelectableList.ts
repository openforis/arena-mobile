import { useCallback, useEffect, useState } from "react";

import { Arrays } from "@openforis/arena-core";

const initialState = {
  selectionEnabled: false,
  selectedItemIds: [],
};

export const useSelectableList = (props: any) => {
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
    (item: any) => {
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
      // Only an explicit `false` (e.g. user canceled the confirm dialog) means nothing was
      // deleted: keep the selection in that case, so the user can still choose another
      // action for the items they selected. Any other result (true, undefined/void, for
      // handlers that don't report cancellation) is treated as "deleted".
      onDeleteSelectedItemIds(selectedItemIds)
        ?.then((deleted: boolean | void) => {
          if (deleted !== false) performDelete();
        })
        ?.catch(() => {
          // ignore it
        });
    } else {
      performDelete();
    }
  }, [selectedItemIds, onDeleteSelectedItemIds, onSelectionChange]);

  const onItemPress = useCallback(
    (item: any) => {
      if (selectionEnabled) {
        onItemSelect(item);
      } else {
        onItemPressProp?.(item);
      }
    },
    [onItemPressProp, onItemSelect, selectionEnabled]
  );

  const onItemLongPress = useCallback(
    (item: any) => {
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
