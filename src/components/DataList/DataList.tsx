import { useCallback } from "react";
import { FlatList, TouchableHighlight } from "react-native";

import { Objects } from "@openforis/arena-core";

import { ScreenViewMode } from "model";

import { Checkbox } from "../Checkbox";
import { FormItem } from "../FormItem";
import { HView } from "../HView";
import { VView } from "../VView";
import { ItemSelectedBanner, useSelectableList } from "../SelectableList";
import { useStyles } from "./styles";

export type DataListProps = {
  fields: any[];
  items: any[];
  onItemPress?: (item: any) => void;
  onItemLongPress?: (item: any) => void;
  onDeleteSelectedItemIds?: (ids: string[]) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  selectable?: boolean;
  selectedItemsCustomActions?: any[];
};

export const DataList = (props: DataListProps) => {
  const {
    fields,
    items,
    onItemPress: onItemPressProp,
    onItemLongPress: onItemLongPressProp,
    onDeleteSelectedItemIds,
    onSelectionChange,
    selectable,
    selectedItemsCustomActions,
  } = props;

  const styles = useStyles();

  const {
    onDeleteSelected,
    onItemPress,
    onItemLongPress,
    onItemSelect,
    selectedItemIds,
    selectionEnabled,
  } = useSelectableList({
    onDeleteSelectedItemIds,
    onItemPress: onItemPressProp,
    onItemLongPress: onItemLongPressProp,
    onSelectionChange,
    selectable,
  });

  const renderItem = useCallback(
    ({
      item,
      separators
    }: any) => (
      <TouchableHighlight
        onPress={() => onItemPress(item)}
        onLongPress={() => onItemLongPress(item)}
        onShowUnderlay={separators.highlight}
        onHideUnderlay={separators.unhighlight}
      >
        <HView style={styles.item}>
          <VView style={{ flex: 1 }}>
            {fields.map((field: any) => {
              const {
                cellRenderer: CellRenderer,
                header,
                headerLabelVariant = "titleSmall",
                headerWidth = undefined,
                key,
                style,
                textVariant = "titleMedium",
              } = field;
              return (
                <FormItem
                  key={key}
                  labelKey={header}
                  labelNumberOfLines={1}
                  labelStyle={headerWidth ? { width: headerWidth } : null}
                  labelVariant={headerLabelVariant}
                  style={style}
                  textVariant={textVariant}
                >
                  {CellRenderer ? (
                    <CellRenderer item={item} viewMode={ScreenViewMode.list} />
                  ) : (
                    String(Objects.path(key.split("."))(item) ?? "")
                  )}
                </FormItem>
              );
            })}
          </VView>
          {selectionEnabled && (
            <Checkbox
              checked={selectedItemIds.includes(item.key)}
              onPress={() => onItemSelect(item)}
            />
          )}
        </HView>
      </TouchableHighlight>
    ),
    [
      styles.item,
      fields,
      selectionEnabled,
      selectedItemIds,
      onItemPress,
      onItemLongPress,
      onItemSelect,
    ]
  );

  return (
    <VView>
      <ItemSelectedBanner
        customActions={selectedItemsCustomActions}
        onDeleteSelected={onDeleteSelected}
        selectedItemIds={selectedItemIds}
      />
      <FlatList
        data={items}
        keyExtractor={(item) => item.uuid}
        renderItem={renderItem}
      />
    </VView>
  );
};
