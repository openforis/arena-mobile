import type { StyleProp, ViewStyle } from "react-native";

import type { SelectedItemsAction } from "../SelectableList";
import { ScreenViewMode, SortObject } from "model";

// items are identified (e.g. in the selection) by their key
export type DataVisualizerItem = { key: string };

export type DataVisualizerCellProps<
  T extends DataVisualizerItem = DataVisualizerItem,
> = {
  item: T;
  viewMode?: ScreenViewMode;
};

export type DataVisualizerCellRenderer<
  T extends DataVisualizerItem = DataVisualizerItem,
> = (props: DataVisualizerCellProps<T>) => React.ReactElement | null;

// where a field is shown in the cards/compact views (default: detail)
export type DataVisualizerCardRole =
  "title" | "subtitle" | "badge" | "body" | "detail" | "footer";

export type DataVisualizerField<
  T extends DataVisualizerItem = DataVisualizerItem,
> = {
  key: string;
  cardRole?: DataVisualizerCardRole;
  // show the header next to the value in the card title (e.g. record keys)
  cardShowLabel?: boolean;
  cellRenderer?: DataVisualizerCellRenderer<T>;
  header: string;
  // shown instead of the (translated) header text in the table header, to save horizontal
  // space on columns whose meaning is already clear from an icon (e.g. sync status); `header`
  // is still used as the field's label in list/card view, where space isn't as tight
  headerIcon?: string;
  headerLabelVariant?: string;
  headerWidth?: number;
  optional?: boolean;
  // not shown as a column in table view, only in the expanded row
  tableDetail?: boolean;
  sortable?: boolean;
  style?: StyleProp<ViewStyle>;
  textVariant?: string;
};

export type DataVisualizerProps<
  T extends DataVisualizerItem = DataVisualizerItem,
> = {
  canDelete?: boolean;
  fields: DataVisualizerField<T>[];
  horizontalScroll?: boolean;
  items: T[];
  // initial page size of the table view (with showPagination)
  itemsPerPage?: number;
  onItemPress?: (item: T) => void;
  onItemLongPress?: (item: T) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  onSortChange?: (sort: SortObject) => void;
  // Resolving to `false` means nothing was deleted (e.g. the user canceled a confirm
  // dialog) and the current selection is kept; any other result (including void, for
  // handlers that don't report cancellation) clears it.
  onDeleteSelectedItemIds?: (
    ids: string[],
  ) => Promise<boolean | void> | boolean | void;
  selectable?: boolean;
  selectedItemIds?: string[];
  selectedItemsCustomActions?: SelectedItemsAction[];
  showPagination?: boolean;
  sort?: SortObject;
};
