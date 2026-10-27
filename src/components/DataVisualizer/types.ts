import type { StyleProp, ViewStyle } from "react-native";

import type { SelectedItemsAction } from "../SelectableList";
import { ScreenViewMode, SortObject } from "model";

export type DataVisualizerCellProps = {
  item: any;
  viewMode?: ScreenViewMode;
};

export type DataVisualizerCellRenderer = (
  props: DataVisualizerCellProps,
) => React.ReactElement | null;

// where a field is shown in the cards/compact views (default: detail)
export type DataVisualizerCardRole =
  "title" | "subtitle" | "badge" | "body" | "detail" | "footer";

export type DataVisualizerField = {
  key: string;
  cardRole?: DataVisualizerCardRole;
  // show the header next to the value in the card title (e.g. record keys)
  cardShowLabel?: boolean;
  cellRenderer?: DataVisualizerCellRenderer;
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

export type DataVisualizerProps = {
  canDelete?: boolean;
  fields: DataVisualizerField[];
  horizontalScroll?: boolean;
  items: any[];
  onItemPress?: (item: any) => void;
  onItemLongPress?: (item: any) => void;
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
