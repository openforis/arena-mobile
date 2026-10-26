import React from "react";

import { useTranslation } from "localization";
import { ScreenViewMode } from "model";

import { DataVisualizerField } from "../DataVisualizer/types";
import { FlexWrapView } from "../FlexWrapView";
import { HView } from "../HView";
import { Text } from "../Text";
import { VView } from "../VView";
import { getFieldValueText } from "./dataCardsUtils";
import { DataCardsStyles, useStyles } from "./styles";

const emptyValuePlaceholder = "—";

type TextVariant = "bodySmall" | "bodyMedium" | "titleMedium";

type FieldsProps = {
  fields: DataVisualizerField[];
  item: any;
  styles: DataCardsStyles;
  viewMode: ScreenViewMode;
};

const FieldValue = ({
  emphasized = false,
  field,
  item,
  numberOfLines,
  styles,
  variant = "bodyMedium",
  viewMode,
}: Omit<FieldsProps, "fields"> & {
  emphasized?: boolean;
  field: DataVisualizerField;
  numberOfLines?: number;
  variant?: TextVariant;
}) => {
  const { cellRenderer: CellRenderer } = field;
  if (CellRenderer) {
    return <CellRenderer item={item} viewMode={viewMode} />;
  }
  const text = getFieldValueText(item, field);
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        !text && styles.muted,
        emphasized && styles.fieldRowValueEmphasized,
      ]}
      variant={variant}
    >
      {text || emptyValuePlaceholder}
    </Text>
  );
};

export const CardTitle = ({
  fields,
  item,
}: Omit<FieldsProps, "styles" | "viewMode">) => {
  const text = fields
    .map((field) => getFieldValueText(item, field))
    .filter(Boolean)
    .join(" · ");
  if (!text) return null;
  return (
    <Text numberOfLines={2} variant="titleMedium">
      {text}
    </Text>
  );
};

export const CardSubtitle = ({
  fields,
  item,
  styles,
}: Omit<FieldsProps, "viewMode">) => {
  const text = fields
    .map((field) => getFieldValueText(item, field))
    .filter(Boolean)
    .join(" · ");
  if (!text) return null;
  return (
    <Text numberOfLines={1} style={styles.muted} variant="bodySmall">
      {text}
    </Text>
  );
};

export const CardBadges = ({ fields, item, styles, viewMode }: FieldsProps) => {
  if (fields.length === 0) return null;
  return (
    <FlexWrapView style={styles.badges}>
      {fields.map((field) => (
        <FieldValue
          key={field.key}
          field={field}
          item={item}
          styles={styles}
          viewMode={viewMode}
        />
      ))}
    </FlexWrapView>
  );
};

export const CardBody = ({ fields, item, styles, viewMode }: FieldsProps) => (
  <>
    {fields.map((field) => (
      <FieldValue
        key={field.key}
        field={field}
        item={item}
        numberOfLines={3}
        styles={styles}
        viewMode={viewMode}
      />
    ))}
  </>
);

type FieldRowsProps = Omit<FieldsProps, "styles"> & {
  columns?: number;
  emphasized?: boolean;
  labelWidth: number;
  variant?: TextVariant;
};

// one field per line, label and value side by side, never wrapping: labels line up in a
// fixed-width column so values can be scanned vertically
export const FieldRows = (props: FieldRowsProps) => {
  const {
    columns = 1,
    emphasized = false,
    fields,
    item,
    labelWidth,
    variant = "bodyMedium",
    viewMode,
  } = props;

  const styles = useStyles();
  const { t } = useTranslation();

  if (fields.length === 0) return null;

  const rowsPerColumn = Math.ceil(fields.length / columns);
  const fieldsByColumn = Array.from({ length: columns }, (_, index) =>
    fields.slice(index * rowsPerColumn, (index + 1) * rowsPerColumn),
  );

  return (
    <VView style={styles.fieldRows}>
      {fieldsByColumn.map((columnFields, columnIndex) => (
        <VView key={String(columnIndex)} style={styles.fieldRowsColumn}>
          {columnFields.map((field) => (
            <HView key={field.key} style={styles.fieldRow}>
              <Text
                numberOfLines={1}
                style={[styles.muted, { width: labelWidth }]}
                variant={variant === "titleMedium" ? "bodyMedium" : variant}
              >
                {t(field.header)}
              </Text>
              <VView style={styles.fieldRowValue}>
                <FieldValue
                  emphasized={emphasized}
                  field={field}
                  item={item}
                  numberOfLines={1}
                  styles={styles}
                  variant={variant}
                  viewMode={viewMode}
                />
              </VView>
            </HView>
          ))}
        </VView>
      ))}
    </VView>
  );
};
