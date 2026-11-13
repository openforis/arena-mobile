import { memo, useCallback, useMemo } from "react";
import { FlatList, Pressable, useWindowDimensions } from "react-native";

import { useStableCallback } from "hooks/useStableCallback";
import { ScreenViewMode } from "model";

import { Checkbox } from "../Checkbox";
import { FieldRows } from "../DataCards/DataCardParts";
import { getFieldRowsLayout } from "../DataCards/dataCardsUtils";
import {
  DataVisualizerField,
  DataVisualizerProps,
} from "../DataVisualizer/types";
import { HView } from "../HView";
import { ItemSelectedBanner, useSelectableList } from "../SelectableList";
import { VView } from "../VView";
import { useStyles } from "./styles";

// item padding, accent bar and list padding
const itemHorizontalPadding = 48;

type DataListItemProps = {
  fieldRowsLayout: { columns: number; labelWidth: number };
  item: any;
  onLongPress: (item: any) => void;
  onPress: (item: any) => void;
  onSelect: (item: any) => void;
  otherFields: DataVisualizerField[];
  selected: boolean;
  selectionEnabled: boolean;
  styles: ReturnType<typeof useStyles>;
  titleFields: DataVisualizerField[];
};

const DataListItem = memo(function DataListItem(props: DataListItemProps) {
  const {
    fieldRowsLayout,
    item,
    onLongPress,
    onPress,
    onSelect,
    otherFields,
    selected,
    selectionEnabled,
    styles,
    titleFields,
  } = props;

  return (
    <Pressable
      onPress={() => onPress(item)}
      onLongPress={() => onLongPress(item)}
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
          <Checkbox checked={selected} onPress={() => onSelect(item)} />
        )}
      </HView>
    </Pressable>
  );
});

const itemKeyExtractor = (item: any) => String(item.key);

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
  const fieldRowsLayout = useMemo(
    () => getFieldRowsLayout(width - itemHorizontalPadding),
    [width],
  );

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

  // stable handlers: rows re-render only when their own props change
  const onPress = useStableCallback(onItemPress);
  const onLongPress = useStableCallback(onItemLongPress);
  const onSelect = useStableCallback(onItemSelect);

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <DataListItem
        fieldRowsLayout={fieldRowsLayout}
        item={item}
        onLongPress={onLongPress}
        onPress={onPress}
        onSelect={onSelect}
        otherFields={otherFields}
        selected={selectedItemIds.includes(item.key)}
        selectionEnabled={selectionEnabled}
        styles={styles}
        titleFields={titleFields}
      />
    ),
    [
      fieldRowsLayout,
      onLongPress,
      onPress,
      onSelect,
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
        keyExtractor={itemKeyExtractor}
        renderItem={renderItem}
        style={styles.list}
      />
    </VView>
  );
};
