import {
  ArenaNodeDefCoordinate,
  DEFAULT_SRS_INDEX,
  NodeDefType,
} from "@openforis/arena-core";

import { locationToUiValue } from "./coordinateUiValueUtils";

const nodeDef = {
  uuid: "coordinate-def-uuid",
  type: NodeDefType.coordinate,
  props: { name: "coordinate" },
} as ArenaNodeDefCoordinate;

const location = {
  latitude: 41.7654321,
  longitude: 12.1234567,
  accuracy: 3.456,
  altitude: null,
  altitudeAccuracy: null,
  heading: null,
  speed: null,
};

describe("locationToUiValue", () => {
  test("converts the location to the selected SRS", () => {
    expect(
      locationToUiValue({
        location,
        nodeDef,
        srsTo: "4326",
        srsIndex: DEFAULT_SRS_INDEX,
      }),
    ).toEqual({
      x: "12.123457",
      y: "41.765432",
      srs: "4326",
      accuracy: "3.46",
    });
  });

  test("returns null when the SRS is not in the survey SRS index", () => {
    expect(
      locationToUiValue({
        location,
        nodeDef,
        srsTo: "32633",
        srsIndex: DEFAULT_SRS_INDEX,
      }),
    ).toBeNull();
  });
});
