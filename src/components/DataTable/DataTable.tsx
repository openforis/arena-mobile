import { useEffect, useRef } from "react";
import { DataTable as RNPDataTable } from "react-native-paper";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { Objects } from "@openforis/arena-core";

import { useTranslation } from "localization";
import { SortDirection } from "model";
import { DeviceInfoSelectors } from "state/deviceInfo";

import { Checkbox } from "../Checkbox";
import { ScrollView } from "../ScrollView";
import { VView } from "../VView";
import { ItemSelectedBanner, useSelectableList } from "../SelectableList";
import { usePagination } from "./usePagination";

export const DataTable = (props: any) => {
  const {
    canDelete = true,
    fields,
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

  const visibleFields = fields.filter(
    ({ optional = false }) =>
      !optional || fields.length <= 3 || isTablet || isLandscape
  );

  const visibleRows = showPagination ? visibleItems : items;

  const onHeaderPress = (fieldKey: any) => {
    const fieldSortPrev = sort?.[fieldKey];
    const fieldSortNext = SortDirection.getNextSortDirection(fieldSortPrev);
    const sortNext = {};
    // allow only one sort field at a time
    if (fieldSortNext) {
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      sortNext[fieldKey] = fieldSortNext;
    }
    onSortChange(sortNext);
  };

  useEffect(() => {
    // @ts-expect-error TS(2339): Property 'scrollTo' does not exist on type 'never'... Remove this comment to see the full error message
    rowsScrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
  }, [visibleRows]);

  return (
    <VView style={{ flex: 1 }}>
      <ItemSelectedBanner
        canDelete={canDelete}
        customActions={selectedItemsCustomActions}
        onDeleteSelected={onDeleteSelected}
        selectedItemIds={selectedItemIds}
      />
      <RNPDataTable style={{ flex: 1 }}>
        <RNPDataTable.Header>
          {visibleFields.map((field: any) => <RNPDataTable.Title
            key={field.key}
            onPress={() =>
              field.sortable ? onHeaderPress(field.key) : undefined
            }
            sortDirection={sort?.[field.key]}
            style={[{ flex: 1 }, field.style]}
            textStyle={{ fontWeight: "bold", fontSize: 15 }}
          >
            {t(field.header)}
          </RNPDataTable.Title>)}
          {selectionEnabled && (
            // @ts-expect-error TS(2741): Property 'children' is missing in type '{ style: {... Remove this comment to see the full error message
            <RNPDataTable.Title style={{ maxWidth: 40, minWidth: 40 }} />
          )}
        </RNPDataTable.Header>
        // @ts-expect-error TS(2322): Type '{ children: any; persistentScrollbar: true; ... Remove this comment to see the full error message
        <ScrollView persistentScrollbar ref={rowsScrollViewRef}>
          {visibleRows.map((item: any) => <RNPDataTable.Row
            key={item.key}
            onPress={() => onItemPress(item)}
            onLongPress={() => onItemLongPress(item)}
          >
            {visibleFields.map(
              ({
                key: fKey,
                style,
                cellRenderer: CellRenderer = null
              }: any) => (
                <RNPDataTable.Cell
                  key={fKey}
                  style={style}
                  textStyle={{ flex: 1 }}
                >
                  {CellRenderer ? (
                    <CellRenderer item={item} />
                  ) : (
                    String(Objects.path(fKey.split("."))(item) ?? "")
                  )}
                </RNPDataTable.Cell>
              )
            )}
            {selectionEnabled && (
              <RNPDataTable.Cell style={{ maxWidth: 40, minWidth: 40 }}>
                <Checkbox
                  checked={selectedItemIds.includes(item.key)}
                  onPress={() => onItemSelect(item)}
                />
              </RNPDataTable.Cell>
            )}
          </RNPDataTable.Row>)}
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
    </VView>
  );
};

DataTable.propTypes = {
  canDelete: PropTypes.bool,
  fields: PropTypes.array.isRequired,
  items: PropTypes.array.isRequired,
  onItemPress: PropTypes.func,
  onItemLongPress: PropTypes.func,
  onSelectionChange: PropTypes.func,
  onSortChange: PropTypes.func,
  onDeleteSelectedItemIds: PropTypes.func,
  selectable: PropTypes.bool,
  selectedItemIds: PropTypes.array,
  selectedItemsCustomActions: PropTypes.array,
  showPagination: PropTypes.bool,
  sort: PropTypes.object,
};
