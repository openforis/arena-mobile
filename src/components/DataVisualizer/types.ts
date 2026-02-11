import { StyleProp, ViewStyle } from "react-native";

import { ScreenViewMode, SortObject } from "model";

export type DataVisualizerCellRenderer = ({
  item,
  headerWidth,
  viewMode,
}: {
  item: any;
  headerWidth?: number;
  viewMode?: ScreenViewMode;
}) => React.ReactElement | null;

export type DataVisualizerField = {
  key: string;
  header: string;
  style?: StyleProp<ViewStyle>;
  cellRenderer?: DataVisualizerCellRenderer;
  optional?: boolean;
  sortable?: boolean;
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
