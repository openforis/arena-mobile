import { StyleProp, ViewStyle } from "react-native";

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
  items: any[];
  onItemPress?: (item: any) => void;
  onItemLongPress?: (item: any) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  onSortChange?: (sort: SortObject) => void;
  onDeleteSelectedItemIds?: (ids: string[]) => void;
  selectable?: boolean;
  selectedItemIds?: string[];
  selectedItemsCustomActions?: any[];
  showPagination?: boolean;
  sort?: SortObject;
};
