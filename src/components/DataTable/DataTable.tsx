import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleProp,
  useWindowDimensions,
  ViewStyle,
} from "react-native";
import { DataTable as RNPDataTable, useTheme } from "react-native-paper";

import { Arrays, Dictionary, Objects } from "@openforis/arena-core";

import { useStableCallback } from "hooks/useStableCallback";
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
import { getItemKeysSignature } from "./dataTableUtils";
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

type DataTableRowProps = {
  detailFields: DataVisualizerField[];
  expandable: boolean;
  expanded: boolean;
  expandedRowLayout: { columns: number; labelWidth: number };
  expandedRowStyle: StyleProp<ViewStyle>;
  item: any;
  onLongPress: (item: any) => void;
  onPress: (item: any) => void;
  onSelect: (item: any) => void;
  onToggleExpanded: (key: any) => void;
  selected: boolean;
  selectionEnabled: boolean;
  toggleColor: string;
  visibleFields: DataVisualizerField[];
};

const DataTableRow = memo(function DataTableRow(props: DataTableRowProps) {
  const {
    detailFields,
    expandable,
    expanded,
    expandedRowLayout,
    expandedRowStyle,
    item,
    onLongPress,
    onPress,
    onSelect,
    onToggleExpanded,
    selected,
    selectionEnabled,
    toggleColor,
    visibleFields,
  } = props;

  return (
    <>
      <RNPDataTable.Row
        onPress={() => onPress(item)}
        onLongPress={() => onLongPress(item)}
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
                <CellRenderer item={item} viewMode={ScreenViewMode.table} />
              ) : (
                String(Objects.path(fKey.split("."))(item) ?? "")
              )}
            </RNPDataTable.Cell>
          ),
        )}
        {expandable && (
          <RNPDataTable.Cell style={styles.expandColumn}>
            <ExpandToggle
              color={toggleColor}
              icon={expanded ? "chevron-up" : "chevron-down"}
              onPress={() => onToggleExpanded(item.key)}
            />
          </RNPDataTable.Cell>
        )}
        {selectionEnabled && (
          <RNPDataTable.Cell style={styles.tableTitleTextSelected}>
            <Checkbox checked={selected} onPress={() => onSelect(item)} />
          </RNPDataTable.Cell>
        )}
      </RNPDataTable.Row>
      {expanded && (
        <VView style={expandedRowStyle}>
          <FieldRows
            columns={expandedRowLayout.columns}
            fields={detailFields}
            item={item}
            labelWidth={expandedRowLayout.labelWidth}
            viewMode={ScreenViewMode.list}
          />
        </VView>
      )}
    </>
  );
});

const rowKeyExtractor = (item: any) => String(item.key);

export const DataTable = (props: DataVisualizerProps) => {
  const {
    canDelete = true,
    fields,
    horizontalScroll = false,
    items,
    itemsPerPage: initialItemsPerPage,
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
  } = usePagination({ items, initialItemsPerPage });

  const rowsListRef = useRef<FlatList>(null);

  const isTablet = DeviceInfoSelectors.useIsTablet();
  const isLandscape = DeviceInfoSelectors.useOrientationIsLandscape();

  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const expandedRowLayout = useMemo(
    () => getFieldRowsLayout(width - 32),
    [width],
  );
  const expandedRowStyle = useMemo(
    () => [
      styles.expandedRow,
      {
        backgroundColor: colors.elevation.level1,
        borderBottomColor: colors.outlineVariant,
      },
    ],
    [colors],
  );

  const { visibleFields, detailFields } = useMemo(() => {
    const columnFields = fields.filter(({ tableDetail }) => !tableDetail);
    const _visibleFields = columnFields.filter(
      ({ optional = false }) =>
        !optional || columnFields.length <= 3 || isTablet || isLandscape,
    );
    // fields that don't fit as columns are shown in the expanded row instead
    const _detailFields = fields.filter(
      (field) => !_visibleFields.includes(field),
    );
    return { visibleFields: _visibleFields, detailFields: _detailFields };
  }, [fields, isLandscape, isTablet]);
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

  // scroll to top only when the sort or the set of rows changes
  const sortSignature = JSON.stringify(sort ?? null);
  const rowKeysSignature = useMemo(
    () => getItemKeysSignature(visibleRows),
    [visibleRows],
  );
  useEffect(() => {
    rowsListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [rowKeysSignature, sortSignature]);

  // stable handlers: rows re-render only when their own props change
  const onRowPress = useStableCallback(onItemPress);
  const onRowLongPress = useStableCallback(onItemLongPress);
  const onRowSelect = useStableCallback(onItemSelect);

  const renderRow = useCallback(
    ({ item }: { item: any }) => (
      <DataTableRow
        detailFields={detailFields}
        expandable={expandable}
        expanded={expandedKeys.includes(item.key)}
        expandedRowLayout={expandedRowLayout}
        expandedRowStyle={expandedRowStyle}
        item={item}
        onLongPress={onRowLongPress}
        onPress={onRowPress}
        onSelect={onRowSelect}
        onToggleExpanded={toggleExpanded}
        selected={selectedItemIds.includes(item.key)}
        selectionEnabled={selectionEnabled}
        toggleColor={colors.onSurfaceVariant}
        visibleFields={visibleFields}
      />
    ),
    [
      colors.onSurfaceVariant,
      detailFields,
      expandable,
      expandedKeys,
      expandedRowLayout,
      expandedRowStyle,
      onRowLongPress,
      onRowPress,
      onRowSelect,
      selectedItemIds,
      selectionEnabled,
      toggleExpanded,
      visibleFields,
    ],
  );

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
      <FlatList
        data={visibleRows}
        keyExtractor={rowKeyExtractor}
        persistentScrollbar
        ref={rowsListRef}
        renderItem={renderRow}
      />
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
