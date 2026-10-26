import { useCallback, useMemo } from "react";

import { useTranslation } from "localization";
import { Sort, SortObject } from "model";

import { DataVisualizerField } from "../DataVisualizer/types";
import { HView } from "../HView";
import { IconButton } from "../IconButton";
import { MenuButton } from "../MenuButton";
import { Text } from "../Text";
import { DataCardsStyles } from "./styles";

type Props = {
  fields: DataVisualizerField[];
  onSortChange?: (sort: SortObject) => void;
  sort?: SortObject;
  styles: DataCardsStyles;
};

// cards and compact rows have no column headers to tap on: sort via a field menu instead
export const DataSortBar = (props: Props) => {
  const { fields, onSortChange, sort, styles } = props;

  const { t } = useTranslation();

  const sortableFields = useMemo(
    () => fields.filter((field) => field.sortable),
    [fields],
  );
  const [sortFieldKey, sortDirection] = Object.entries(sort ?? {})[0] ?? [];
  const sortField = sortableFields.find((field) => field.key === sortFieldKey);

  const menuItems = useMemo(
    () =>
      sortableFields.map((field) => ({
        key: field.key,
        icon: field.key === sortFieldKey ? "check" : undefined,
        label: t(field.header),
        labelIsI18nKey: false,
        onPress: () =>
          onSortChange?.({ [field.key]: sortDirection ?? Sort.asc }),
      })),
    [onSortChange, sortDirection, sortFieldKey, sortableFields, t],
  );

  const onDirectionPress = useCallback(() => {
    if (!sortFieldKey) return;
    onSortChange?.({
      [sortFieldKey]: sortDirection === Sort.asc ? Sort.desc : Sort.asc,
    });
  }, [onSortChange, sortDirection, sortFieldKey]);

  if (!onSortChange || sortableFields.length === 0) return null;

  return (
    <HView style={styles.sortBar}>
      <Text
        style={styles.muted}
        textKey="common:sortBy"
        variant="labelMedium"
      />
      <MenuButton
        icon="sort"
        items={menuItems}
        label={sortField ? sortField.header : "common:none"}
        mode="text"
      />
      {sortField && (
        <IconButton
          icon={
            sortDirection === Sort.asc ? "sort-ascending" : "sort-descending"
          }
          mode="outlined"
          onPress={onDirectionPress}
          size={16}
        />
      )}
    </HView>
  );
};
