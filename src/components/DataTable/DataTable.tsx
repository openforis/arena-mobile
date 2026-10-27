import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, useWindowDimensions } from "react-native";
import { DataTable as RNPDataTable, useTheme } from "react-native-paper";

import { Arrays, Dictionary, Objects } from "@openforis/arena-core";

import { useTranslation } from "localization";
import { ScreenViewMode, Sort, SortUtils } from "model";
import { DeviceInfoSelectors } from "state/deviceInfo";

import { Checkbox } from "../Checkbox";
import { FieldRows } from "../DataCards/DataCardParts";
import { getFieldRowsLayout } from "../DataCards/dataCardsUtils";
import {
  DataVisualizerField,
  DataVisualizerProps,
} from "../DataVisualizer/types";
import { Icon } from "../Icon";
import { ScrollView } from "../ScrollView";
import { ItemSelectedBanner, useSelectableList } from "../SelectableList";
import { Tooltip } from "../Tooltip";
import { VView } from "../VView";
import { usePagination } from "./usePagination";
import styles from "./styles";

const ExpandToggle = ({
  color,
  icon,
  onPress,
}: {
  color: string;
  icon: string;
  onPress: () => void;
}) => (
  <Pressable
    android_ripple={{ borderless: true, radius: 18 }}
    hitSlop={10}
    onPress={onPress}
  >
    <Icon color={color} size={24} source={icon} />
  </Pressable>
);

export const DataTable = (props: DataVisualizerProps) => {
  const {
    canDelete = true,
    fields,
    horizontalScroll = false,
    items,
    onItemPress: onItemPressProp,
    onItemLongPress: onItemLongPressProp,
    onSelectionChange,
    onSortChange = null,
    onDeleteSelectedItemIds,
    selectable = false,
    selectedItemIds: selectedItemIdsProp,
    selectedItemsCustomActions = [],
    showPagination = false,
    sort = null,
  } = props;

  const { t } = useTranslation();

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

  const {
    itemFrom,
    itemTo,
    itemsPerPage,
    itemsPerPageOptions,
    numberOfPages,
    page,
    visibleItems,
    onItemsPerPageChange,
    onPageChange,
  } = usePagination({ items: items });

  const rowsScrollViewRef = useRef(null);

  const isTablet = DeviceInfoSelectors.useIsTablet();
  const isLandscape = DeviceInfoSelectors.useOrientationIsLandscape();

  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const expandedRowLayout = getFieldRowsLayout(width - 32);

  const columnFields = fields.filter(({ tableDetail }) => !tableDetail);
  const visibleFields = columnFields.filter(
    ({ optional = false }) =>
      !optional || columnFields.length <= 3 || isTablet || isLandscape,
  );
  // fields that don't fit as columns are shown in the expanded row instead
  const detailFields = fields.filter((field) => !visibleFields.includes(field));
  const expandable = detailFields.length > 0;

  const [expandedKeys, setExpandedKeys] = useState<any[]>([]);
  const allExpanded = items.length > 0 && expandedKeys.length === items.length;

  const toggleExpanded = useCallback(
    (key: any) =>
      setExpandedKeys((keysPrev) =>
        keysPrev.includes(key)
          ? Arrays.removeItem(key)(keysPrev)
          : Arrays.addItem(key)(keysPrev),
      ),
    [],
  );

  const toggleAllExpanded = useCallback(
    () => setExpandedKeys(allExpanded ? [] : items.map((item) => item.key)),
    [allExpanded, items],
  );

  const visibleRows = showPagination ? visibleItems : items;

  const onHeaderPress = (fieldKey: string) => {
    const fieldSortPrev = sort?.[fieldKey];
    const fieldSortNext = SortUtils.getNextSortDirection(fieldSortPrev);
    const sortNext: Dictionary<Sort> = {};
    // allow only one sort field at a time
    if (fieldSortNext) {
      sortNext[fieldKey] = fieldSortNext;
    }
    onSortChange?.(sortNext);
  };

  useEffect(() => {
    const rowsScrollViewEl: any = rowsScrollViewRef.current;
    rowsScrollViewEl?.scrollTo({ x: 0, y: 0, animated: false });
  }, [visibleRows]);

  const table = (
    <RNPDataTable style={styles.table}>
      <RNPDataTable.Header>
        {visibleFields.map((field: DataVisualizerField) => (
          <RNPDataTable.Title
            key={field.key}
            onPress={() =>
              field.sortable ? onHeaderPress(field.key) : undefined
            }
            sortDirection={sort?.[field.key]}
            style={[{ flex: 1 }, field.style]}
            textStyle={styles.tableTitleText}
          >
            {field.headerIcon ? (
              <Tooltip titleKey={field.header}>
                <Icon source={field.headerIcon} />
              </Tooltip>
            ) : (
              t(field.header)
            )}
          </RNPDataTable.Title>
        ))}
        {expandable && (
          <RNPDataTable.Title style={styles.expandColumn}>
            <ExpandToggle
              color={colors.onSurfaceVariant}
              icon={
                allExpanded
                  ? "unfold-less-horizontal"
                  : "unfold-more-horizontal"
              }
              onPress={toggleAllExpanded}
            />
          </RNPDataTable.Title>
        )}
        {selectionEnabled && (
          <RNPDataTable.Title style={styles.tableTitleTextSelected}>
            <>{/* spacer */}</>
          </RNPDataTable.Title>
        )}
      </RNPDataTable.Header>
      <ScrollView persistentScrollbar ref={rowsScrollViewRef}>
        {visibleRows.map((item: any) => (
          <React.Fragment key={item.key}>
            <RNPDataTable.Row
              onPress={() => onItemPress(item)}
              onLongPress={() => onItemLongPress(item)}
            >
              {visibleFields.map(
                ({
                  key: fKey,
                  style,
                  cellRenderer: CellRenderer,
                }: DataVisualizerField) => (
                  <RNPDataTable.Cell
                    key={fKey}
                    style={style}
                    textStyle={styles.tableTitleCellText}
                  >
                    {CellRenderer ? (
                      <CellRenderer
                        item={item}
                        viewMode={ScreenViewMode.table}
                      />
                    ) : (
                      String(Objects.path(fKey.split("."))(item) ?? "")
                    )}
                  </RNPDataTable.Cell>
                ),
              )}
              {expandable && (
                <RNPDataTable.Cell style={styles.expandColumn}>
                  <ExpandToggle
                    color={colors.onSurfaceVariant}
                    icon={
                      expandedKeys.includes(item.key)
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    onPress={() => toggleExpanded(item.key)}
                  />
                </RNPDataTable.Cell>
              )}
              {selectionEnabled && (
                <RNPDataTable.Cell style={styles.tableTitleTextSelected}>
                  <Checkbox
                    checked={selectedItemIds.includes(item.key)}
                    onPress={() => onItemSelect(item)}
                  />
                </RNPDataTable.Cell>
              )}
            </RNPDataTable.Row>
            {expandedKeys.includes(item.key) && (
              <VView
                style={[
                  styles.expandedRow,
                  {
                    backgroundColor: colors.elevation.level1,
                    borderBottomColor: colors.outlineVariant,
                  },
                ]}
              >
                <FieldRows
                  columns={expandedRowLayout.columns}
                  fields={detailFields}
                  item={item}
                  labelWidth={expandedRowLayout.labelWidth}
                  viewMode={ScreenViewMode.list}
                />
              </VView>
            )}
          </React.Fragment>
        ))}
      </ScrollView>
      {showPagination && (
        <RNPDataTable.Pagination
          page={page}
          numberOfPages={numberOfPages}
          onPageChange={onPageChange}
          label={t("common:fromToOf", {
            from: itemFrom + 1,
            to: itemTo,
            of: items.length,
          })}
          numberOfItemsPerPageList={itemsPerPageOptions}
          numberOfItemsPerPage={itemsPerPage}
          onItemsPerPageChange={onItemsPerPageChange}
          showFastPaginationControls
          selectPageDropdownLabel={t("common:rowsPerPage")}
        />
      )}
    </RNPDataTable>
  );

  return (
    <VView style={styles.container}>
      <ItemSelectedBanner
        canDelete={canDelete}
        customActions={selectedItemsCustomActions}
        onDeleteSelected={onDeleteSelected}
        selectedItemIds={selectedItemIds}
      />
      {horizontalScroll ? (
        <ScrollView horizontal persistentScrollbar>
          {table}
        </ScrollView>
      ) : (
        table
      )}
    </VView>
  );
};
