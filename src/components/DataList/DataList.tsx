import { useCallback, useMemo } from "react";
import { FlatList, Pressable, useWindowDimensions } from "react-native";

import { ScreenViewMode } from "model";

import { Checkbox } from "../Checkbox";
import { FieldRows } from "../DataCards/DataCardParts";
import { getFieldRowsLayout } from "../DataCards/dataCardsUtils";
import { DataVisualizerProps } from "../DataVisualizer/types";
import { HView } from "../HView";
import { ItemSelectedBanner, useSelectableList } from "../SelectableList";
import { VView } from "../VView";
import { useStyles } from "./styles";

// item padding, accent bar and list padding
const itemHorizontalPadding = 48;

export const DataList = (props: DataVisualizerProps) => {
  const {
    canDelete = true,
    fields,
    items,
    onItemPress: onItemPressProp,
    onItemLongPress: onItemLongPressProp,
    onDeleteSelectedItemIds,
    onSelectionChange,
    selectable,
    selectedItemIds: selectedItemIdsProp,
    selectedItemsCustomActions,
  } = props;

  const styles = useStyles();
  const { width } = useWindowDimensions();
  const fieldRowsLayout = getFieldRowsLayout(width - itemHorizontalPadding);

  // title fields (e.g. record keys) are emphasized at the top of each item
  const { titleFields, otherFields } = useMemo(
    () => ({
      titleFields: fields.filter((field) => field.cardRole === "title"),
      otherFields: fields.filter((field) => field.cardRole !== "title"),
    }),
    [fields],
  );

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
    selectedItemIds: selectedItemIdsProp,
  });

  const renderItem = useCallback(
    ({ item }: any) => {
      const selected = selectedItemIds.includes(item.key);
      return (
        <Pressable
          onPress={() => onItemPress(item)}
          onLongPress={() => onItemLongPress(item)}
          style={({ pressed }) => [
            styles.item,
            selected && styles.itemSelected,
            pressed && styles.itemPressed,
          ]}
        >
          <VView style={[styles.accent, selected && styles.accentSelected]} />
          <HView style={styles.itemContent}>
            <VView style={styles.fields}>
              {titleFields.length > 0 && (
                <>
                  <FieldRows
                    emphasized
                    fields={titleFields}
                    item={item}
                    labelWidth={fieldRowsLayout.labelWidth}
                    variant="titleMedium"
                    viewMode={ScreenViewMode.list}
                  />
                  {otherFields.length > 0 && <VView style={styles.divider} />}
                </>
              )}
              <FieldRows
                columns={fieldRowsLayout.columns}
                fields={otherFields}
                item={item}
                labelWidth={fieldRowsLayout.labelWidth}
                viewMode={ScreenViewMode.list}
              />
            </VView>
            {selectionEnabled && (
              <Checkbox checked={selected} onPress={() => onItemSelect(item)} />
            )}
          </HView>
        </Pressable>
      );
    },
    [
      fieldRowsLayout,
      onItemLongPress,
      onItemPress,
      onItemSelect,
      otherFields,
      selectedItemIds,
      selectionEnabled,
      styles,
      titleFields,
    ],
  );

  return (
    <VView fullFlex>
      <ItemSelectedBanner
        canDelete={canDelete}
        customActions={selectedItemsCustomActions}
        onDeleteSelected={onDeleteSelected}
        selectedItemIds={selectedItemIds}
      />
      <FlatList
        contentContainerStyle={styles.listContent}
        data={items}
        extraData={selectedItemIds}
        keyExtractor={(item) => String(item.key)}
        renderItem={renderItem}
        style={styles.list}
      />
    </VView>
  );
};
