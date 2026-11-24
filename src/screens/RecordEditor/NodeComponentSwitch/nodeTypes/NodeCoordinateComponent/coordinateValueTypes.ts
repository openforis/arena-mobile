import type { ArenaRecordNodeValueCoordinate } from "@openforis/arena-core";

// additional fields (accuracy, altitude, ...) are not part of the arena-core type
export type CoordinateValueWithExtraFields = ArenaRecordNodeValueCoordinate &
  Partial<Record<string, number | string>>;

// x, y, srs and additional fields as strings, indexed by field name
export type CoordinateUiValue = {
  x: string;
  y: string;
  srs: string;
  accuracy?: string;
} & Partial<Record<string, string>>;
