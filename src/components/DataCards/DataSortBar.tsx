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

const toggleDirection = (direction?: string) =>
  direction === Sort.asc ? Sort.desc : Sort.asc;

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
  const directionIcon = sortDirection === Sort.desc ? "arrow-down" : "arrow-up";

  const menuItems = useMemo(
    () =>
      sortableFields.map((field) => ({
        key: field.key,
        icon: field.key === sortFieldKey ? directionIcon : undefined,
        label: t(field.header),
        labelIsI18nKey: false,
        // selecting the current field again reverses the direction
        onPress: () =>
          onSortChange?.({
            [field.key]:
              field.key === sortFieldKey
                ? toggleDirection(sortDirection)
                : (sortDirection ?? Sort.asc),
          }),
      })),
    [
      directionIcon,
      onSortChange,
      sortDirection,
      sortFieldKey,
      sortableFields,
      t,
    ],
  );

  const onDirectionPress = useCallback(() => {
    if (!sortFieldKey) return;
    onSortChange?.({ [sortFieldKey]: toggleDirection(sortDirection) });
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
        items={menuItems}
        label={sortField ? sortField.header : "common:none"}
        mode="text"
      />
      {sortField && (
        <IconButton
          icon={directionIcon}
          mode="text"
          onPress={onDirectionPress}
          size={18}
          style={styles.sortDirectionButton}
        />
      )}
    </HView>
  );
};
