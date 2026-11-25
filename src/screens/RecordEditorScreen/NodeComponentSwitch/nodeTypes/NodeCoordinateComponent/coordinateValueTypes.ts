import type { ArenaCoordinateAdditionalField } from "@openforis/arena-core";

// numeric fields editable in the form
export type CoordinateUiField = "x" | "y" | ArenaCoordinateAdditionalField;

// x, y, srs and additional fields as strings
export type CoordinateUiValue = {
  x: string;
  y: string;
  srs: string;
} & Partial<Record<ArenaCoordinateAdditionalField, string>>;
