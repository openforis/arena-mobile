import {
  ArenaNodeDefCoordinate,
  ArenaSRSIndex,
  NodeDefs,
  Numbers,
  Objects,
  PointFactory,
  Points,
} from "@openforis/arena-core";

import { LocationPoint } from "model";

import { CoordinateUiValue } from "./coordinateValueTypes";

export const stringToNumber = (str: string | undefined) =>
  Numbers.toNumber(str);
export const numberToString = (
  num: number | string | null | undefined,
  roundToDecimals = Number.NaN,
) => {
  if (Objects.isEmpty(num)) return "";
  return String(Numbers.roundToPrecision(num, roundToDecimals));
};
export const pointToUiValue = ({
  x,
  y,
  srs,
}: {
  x?: number | string;
  y?: number | string;
  srs: string;
}): CoordinateUiValue => ({
  x: numberToString(x),
  y: numberToString(y),
  srs,
});

export const locationToUiValue = ({
  location,
  nodeDef,
  srsTo,
  srsIndex,
}: {
  location: LocationPoint;
  nodeDef: ArenaNodeDefCoordinate;
  srsTo: string;
  srsIndex?: ArenaSRSIndex;
}): CoordinateUiValue | null => {
  const { latitude, longitude, accuracy } = location;

  const pointLatLong = PointFactory.createInstance({
    x: longitude,
    y: latitude,
  });
  const point = Points.transform(pointLatLong, srsTo, srsIndex);
  if (!point) {
    return null;
  }
  const { x, y } = point;

  const includedExtraFields = NodeDefs.getCoordinateAdditionalFields(nodeDef);

  const result = pointToUiValue({
    x: Numbers.roundToPrecision(x, 6),
    y: Numbers.roundToPrecision(y, 6),
    srs: srsTo,
  });

  for (const field of includedExtraFields) {
    result[field] = numberToString(location[field], 2);
  }
  // always include accuracy
  result.accuracy = numberToString(accuracy, 2);
  return result;
};
