import { StyleProp, ViewStyle } from "react-native";

import { SortObject } from "model";

export type DataVisualizerField = {
  key: string;
  header: string;
  style?: StyleProp<ViewStyle>;
  cellRenderer?: ({ item }: { item: any }) => React.ReactElement | null;
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
