import { useCallback, useMemo } from "react";
import { FlatList, Pressable, useWindowDimensions } from "react-native";

import { ScreenViewMode } from "model";

import { Checkbox } from "../Checkbox";
import { DataVisualizerProps } from "../DataVisualizer/types";
import { HView } from "../HView";
import { ItemSelectedBanner, useSelectableList } from "../SelectableList";
import { VView } from "../VView";
import {
  CardBadges,
  CardBody,
  CardSubtitle,
  CardTitle,
  FieldRows,
} from "./DataCardParts";
import { DataSortBar } from "./DataSortBar";
import { getFieldRowsLayout, groupFieldsByCardRole } from "./dataCardsUtils";
import { useStyles } from "./styles";

const minCardWidth = 420;
// card padding and list padding
const cardHorizontalPadding = 40;

export const DataCardList = (props: DataVisualizerProps) => {
  const {
    canDelete = true,
    fields,
    items,
    onItemPress: onItemPressProp,
    onItemLongPress: onItemLongPressProp,
    onDeleteSelectedItemIds,
    onSelectionChange,
    onSortChange,
    selectable,
    selectedItemIds: selectedItemIdsProp,
    selectedItemsCustomActions,
    sort,
  } = props;

  const styles = useStyles();
  const { width } = useWindowDimensions();
  // tablets / landscape: more cards side by side
  const numColumns = Math.max(1, Math.floor(width / minCardWidth));
  const cardContentWidth = width / numColumns - cardHorizontalPadding;
  const detailsLayout = getFieldRowsLayout(cardContentWidth);

  const fieldsByRole = useMemo(() => {
    const { title, ...otherFieldsByRole } = groupFieldsByCardRole(fields);
    // title fields with label (e.g. record keys) are shown as label/value rows
    return {
      ...otherFieldsByRole,
      title: title.filter((field) => !field.cardShowLabel),
      titleRows: title.filter((field) => field.cardShowLabel),
    };
  }, [fields]);

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
      const viewMode = ScreenViewMode.cards;
      const partProps = { item, styles, viewMode };
      const hasDetails =
        fieldsByRole.body.length > 0 || fieldsByRole.detail.length > 0;
      return (
        <Pressable
          onPress={() => onItemPress(item)}
          onLongPress={() => onItemLongPress(item)}
          style={[styles.card, selected && styles.cardSelected]}
        >
          <HView style={styles.header}>
            {selectionEnabled && (
              <Checkbox checked={selected} onPress={() => onItemSelect(item)} />
            )}
            <VView style={styles.headerTexts}>
              <CardTitle fields={fieldsByRole.title} item={item} />
              <CardSubtitle fields={fieldsByRole.subtitle} {...partProps} />
              <FieldRows
                emphasized
                fields={fieldsByRole.titleRows}
                item={item}
                labelWidth={detailsLayout.labelWidth}
                variant="titleMedium"
                viewMode={viewMode}
              />
            </VView>
            <CardBadges fields={fieldsByRole.badge} {...partProps} />
          </HView>
          {hasDetails && fieldsByRole.titleRows.length > 0 && (
            <VView style={styles.divider} />
          )}
          <CardBody fields={fieldsByRole.body} {...partProps} />
          <FieldRows
            columns={detailsLayout.columns}
            fields={fieldsByRole.detail}
            item={item}
            labelWidth={detailsLayout.labelWidth}
            viewMode={viewMode}
          />
          {fieldsByRole.footer.length > 0 && <VView style={styles.divider} />}
          <FieldRows
            columns={detailsLayout.columns}
            fields={fieldsByRole.footer}
            item={item}
            labelWidth={detailsLayout.labelWidth}
            variant="bodySmall"
            viewMode={viewMode}
          />
        </Pressable>
      );
    },
    [
      detailsLayout,
      fieldsByRole,
      onItemLongPress,
      onItemPress,
      onItemSelect,
      selectedItemIds,
      selectionEnabled,
      styles,
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
      <DataSortBar
        fields={fields}
        onSortChange={onSortChange}
        sort={sort}
        styles={styles}
      />
      <FlatList
        key={numColumns}
        columnWrapperStyle={numColumns > 1 ? styles.cardsRow : undefined}
        contentContainerStyle={styles.listContent}
        data={items}
        extraData={selectedItemIds}
        keyExtractor={(item) => String(item.key)}
        numColumns={numColumns}
        renderItem={renderItem}
        style={styles.list}
      />
    </VView>
  );
};
