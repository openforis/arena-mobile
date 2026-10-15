import { NodeDefType, Survey, Surveys } from "@openforis/arena-core";

import demoSurveyJson from "../../service/demoSurvey.json";

import {
  PositionTracks,
  TrackPoint,
  TrackPointRejectReason,
} from "./PositionTracks";

const t0 = Date.parse("2026-10-15T08:00:00Z");

const point = (
  latitude: number,
  longitude: number,
  secondsFromStart: number,
  accuracy: number | null = 3,
): TrackPoint => ({
  latitude,
  longitude,
  altitude: null,
  accuracy,
  time: t0 + secondsFromStart * 1000,
});

// ~11.1 m per 0.0001 degrees of latitude
const latStep = 0.0001;

describe("PositionTracks.distance", () => {
  test("computes the distance between two points", () => {
    const d = PositionTracks.distance(point(0, 0, 0), point(latStep, 0, 0));
    expect(d).toBeCloseTo(11.12, 1);
  });
});

describe("PositionTracks.evaluatePoint", () => {
  const params = { accuracyThreshold: 20, minDistance: 3 };

  test("accepts the first point when accurate enough", () => {
    expect(
      PositionTracks.evaluatePoint({
        ...params,
        point: point(0, 0, 0),
        lastPoint: null,
      }),
    ).toBeNull();
  });

  test("accepts points without accuracy", () => {
    expect(
      PositionTracks.evaluatePoint({
        ...params,
        point: point(0, 0, 0, null),
        lastPoint: null,
      }),
    ).toBeNull();
  });

  test("rejects inaccurate points", () => {
    expect(
      PositionTracks.evaluatePoint({
        ...params,
        point: point(0, 0, 0, 25),
        lastPoint: null,
      }),
    ).toBe(TrackPointRejectReason.lowAccuracy);
  });

  test("rejects points too close to the last one", () => {
    expect(
      PositionTracks.evaluatePoint({
        ...params,
        point: point(0.00001, 0, 10),
        lastPoint: point(0, 0, 0),
      }),
    ).toBe(TrackPointRejectReason.tooClose);
  });

  test("rejects jumps", () => {
    expect(
      PositionTracks.evaluatePoint({
        ...params,
        point: point(0.01, 0, 1),
        lastPoint: point(0, 0, 0),
      }),
    ).toBe(TrackPointRejectReason.jump);
  });

  test("accepts a walking step", () => {
    expect(
      PositionTracks.evaluatePoint({
        ...params,
        point: point(latStep, 0, 10),
        lastPoint: point(0, 0, 0),
      }),
    ).toBeNull();
  });
});

describe("PositionTracks.toFeature / fromFeature", () => {
  const segments = [
    [point(0, 0, 0), point(latStep, 0, 10), point(2 * latStep, 0, 20, 4)],
    [point(5 * latStep, 0, 100), point(6 * latStep, 0, 110)],
  ];

  test("builds a MultiLineString feature with one line per segment", () => {
    const feature = PositionTracks.toFeature(segments)!;
    expect(feature.geometry.type).toBe("MultiLineString");
    expect(feature.geometry.coordinates).toHaveLength(2);
    expect(feature.geometry.coordinates[0]![1]).toEqual([0, latStep]);
    expect(feature.properties.pointsCount).toBe(5);
    expect(feature.properties.startTime).toBe("2026-10-15T08:00:00.000Z");
    expect(feature.properties.endTime).toBe("2026-10-15T08:01:50.000Z");
    expect(feature.properties.accuracies[0]).toEqual([3, 3, 4]);
    // the gap between segments is not counted
    expect(feature.properties.length).toBeCloseTo(33.4, 0);
  });

  test("skips segments with less than 2 points", () => {
    const feature = PositionTracks.toFeature([
      [point(0, 0, 0)],
      segments[1]!,
    ])!;
    expect(feature.geometry.coordinates).toHaveLength(1);
    expect(PositionTracks.toFeature([[point(0, 0, 0)]])).toBeNull();
    expect(PositionTracks.toFeature([])).toBeNull();
  });

  test("stores altitude when available", () => {
    const feature = PositionTracks.toFeature([
      [
        { ...point(0, 0, 0), altitude: 120 },
        { ...point(latStep, 0, 10), altitude: 121 },
      ],
    ])!;
    expect(feature.geometry.coordinates[0]![0]).toEqual([0, 0, 120]);
  });

  test("round trip", () => {
    const feature = PositionTracks.toFeature(segments);
    expect(PositionTracks.fromFeature(feature)).toEqual(segments);
  });

  test("reads LineString values", () => {
    const segmentsRead = PositionTracks.fromFeature({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [1, 2],
          [3, 4],
        ],
      },
    });
    expect(segmentsRead).toHaveLength(1);
    expect(segmentsRead[0]![1]).toMatchObject({ latitude: 4, longitude: 3 });
  });

  test("isTrackValue", () => {
    expect(PositionTracks.isTrackValue(PositionTracks.toFeature(segments))).toBe(
      true,
    );
    expect(
      PositionTracks.isTrackValue({ geometry: { type: "Polygon" } }),
    ).toBe(false);
    expect(PositionTracks.isTrackValue(null)).toBe(false);
  });
});

describe("PositionTracks.formatLength", () => {
  test("formats meters and kilometers", () => {
    expect(PositionTracks.formatLength(12.4)).toBe("12 m");
    expect(PositionTracks.formatLength(1234)).toBe("1.23 km");
  });
});

describe("PositionTracks node defs", () => {
  const createSurvey = () =>
    JSON.parse(JSON.stringify(demoSurveyJson)) as Survey;

  const makeTrackable = (survey: Survey, name: string) => {
    const nodeDef = Surveys.getNodeDefByName({ survey, name }) as any;
    nodeDef.type = NodeDefType.geo;
    nodeDef.props.positionTracking = true;
    return nodeDef;
  };

  test("isTrackableNodeDef", () => {
    const survey = createSurvey();
    const nodeDef = makeTrackable(survey, "site_location");
    expect(PositionTracks.isTrackableNodeDef(nodeDef)).toBe(true);
    expect(
      PositionTracks.isTrackableNodeDef({
        ...nodeDef,
        props: { ...nodeDef.props, positionTracking: false },
      }),
    ).toBe(false);
    expect(
      PositionTracks.isTrackableNodeDef({
        ...nodeDef,
        props: { ...nodeDef.props, multiple: true },
      }),
    ).toBe(false);
  });

  test("findAutoStartNode picks the first trackable attribute in the root entity or its single entities", () => {
    const survey = createSurvey();
    const inSingleEntityDef = makeTrackable(survey, "site_location");
    const inMultipleEntityDef = makeTrackable(survey, "second_unit_location");

    const record: any = {
      nodes: {
        n1: { uuid: "n1", nodeDefUuid: inMultipleEntityDef.uuid },
        n2: { uuid: "n2", nodeDefUuid: inSingleEntityDef.uuid },
      },
    };
    expect(PositionTracks.findAutoStartNode({ survey, record })?.uuid).toBe(
      "n2",
    );
  });

  test("findAutoStartNode ignores attributes in multiple entities", () => {
    const survey = createSurvey();
    const inMultipleEntityDef = makeTrackable(survey, "second_unit_location");
    const record: any = {
      nodes: { n1: { uuid: "n1", nodeDefUuid: inMultipleEntityDef.uuid } },
    };
    expect(PositionTracks.findAutoStartNode({ survey, record })).toBeNull();
  });
});
