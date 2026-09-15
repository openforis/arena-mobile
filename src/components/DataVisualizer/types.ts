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

export type DataVisualizerField = {
  key: string;
  cellRenderer?: DataVisualizerCellRenderer;
  header: string;
  headerLabelVariant?: string;
  headerWidth?: number;
  optional?: boolean;
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
