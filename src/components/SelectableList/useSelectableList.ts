import { useCallback, useEffect, useState } from "react";

import { Arrays } from "@openforis/arena-core";

const noItemIds: string[] = [];

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

  // the selection is valid for the items (and selectable) it was made with
  const [selection, setSelection] = useState({
    items,
    selectable,
    selectedItemIds: noItemIds,
  });
  const selectionValid =
    selection.items === items && selection.selectable === selectable;

  // controlled by the parent when it passes selectedItemIds
  const selectedItemIds: string[] =
    selectedItemIdsProp ??
    (selectionValid ? selection.selectedItemIds : noItemIds);
  const selectionEnabled = selectedItemIds.length > 0;

  const setSelectedItemIds = useCallback(
    (selectedItemIdsNext: string[]) =>
      setSelection({ items, selectable, selectedItemIds: selectedItemIdsNext }),
    [items, selectable],
  );

  // the selection is reset on items change: notify the parent
  useEffect(() => {
    onSelectionChange?.([]);
  }, [items, onSelectionChange, selectable]);

  const onItemSelect = useCallback(
    (item: any) => {
      const { key } = item;
      const selected = !selectedItemIds.includes(key);
      const selectedItemIdsNext = selected
        ? Arrays.addItem(key)(selectedItemIds)
        : Arrays.removeItem(key)(selectedItemIds);

      setSelectedItemIds(selectedItemIdsNext);

      onSelectionChange?.(selectedItemIdsNext);
    },
    [onSelectionChange, selectedItemIds, setSelectedItemIds],
  );

  const onDeleteSelected = useCallback(() => {
    const performDelete = () => {
      onSelectionChange?.([]);
      setSelectedItemIds(noItemIds);
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
  }, [
    selectedItemIds,
    onDeleteSelectedItemIds,
    onSelectionChange,
    setSelectedItemIds,
  ]);

  const onItemPress = useCallback(
    (item: any) => {
      if (selectionEnabled) {
        onItemSelect(item);
      } else {
        onItemPressProp?.(item);
      }
    },
    [onItemPressProp, onItemSelect, selectionEnabled],
  );

  const onItemLongPress = useCallback(
    (item: any) => {
      if (selectable) {
        onItemSelect(item);
      } else {
        onItemLongPressProp?.(item);
      }
    },
    [onItemLongPressProp, onItemSelect, selectable],
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
