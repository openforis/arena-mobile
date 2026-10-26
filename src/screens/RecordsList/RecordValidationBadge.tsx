import { StyleSheet } from "react-native";

import { Validations } from "@openforis/arena-core";

import { DataVisualizerCellProps, HView, Icon, Text } from "components";

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 6 },
  item: { alignItems: "center", gap: 2 },
});

// errors and warnings counts side by side (used in the cards/compact views)
export const RecordValidationBadge = (props: DataVisualizerCellProps) => {
  const { item: record } = props;
  const validation = Validations.getValidation(record);
  const errors = Validations.getErrorsCount(validation);
  const warnings = Validations.getWarningsCount(validation);

  if (!errors && !warnings) return null;

  return (
    <HView style={styles.container}>
      {errors > 0 && (
        <HView style={styles.item}>
          <Icon color="red" source="alert-circle" />
          <Text variant="labelLarge">{errors}</Text>
        </HView>
      )}
      {warnings > 0 && (
        <HView style={styles.item}>
          <Icon color="orange" source="alert" />
          <Text variant="labelLarge">{warnings}</Text>
        </HView>
      )}
    </HView>
  );
};
