import { Objects } from "@openforis/arena-core";

import {
  DataVisualizerCardRole,
  DataVisualizerField,
  DataVisualizerItem,
} from "../DataVisualizer/types";

export type FieldsByCardRole<T extends DataVisualizerItem> = Record<
  DataVisualizerCardRole,
  DataVisualizerField<T>[]
>;

export const groupFieldsByCardRole = <T extends DataVisualizerItem>(
  fields: DataVisualizerField<T>[],
): FieldsByCardRole<T> => {
  const result: FieldsByCardRole<T> = {
    title: [],
    subtitle: [],
    badge: [],
    body: [],
    detail: [],
    footer: [],
  };
  fields.forEach((field) => {
    result[field.cardRole ?? "detail"].push(field);
  });
  return result;
};

export const getFieldValueText = <T extends DataVisualizerItem>(
  item: T,
  field: DataVisualizerField<T>,
): string => {
  const value = Objects.path<unknown>(field.key.split("."))(item);
  return Objects.isEmpty(value) ? "" : String(value);
};

const minFieldRowsColumnWidth = 280;

// label/value rows layout for the given width: 1 or 2 columns, label ~40% of a column
export const getFieldRowsLayout = (availableWidth: number) => {
  const columns = availableWidth >= minFieldRowsColumnWidth * 2 ? 2 : 1;
  const columnWidth = availableWidth / columns;
  const labelWidth = Math.min(180, Math.round(columnWidth * 0.4));
  return { columns, labelWidth };
};
