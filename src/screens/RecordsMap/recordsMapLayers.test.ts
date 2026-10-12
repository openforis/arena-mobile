import {
  ExtraPropDataType,
  Survey,
  SurveyBuilder,
  SurveyObjectBuilders,
  Surveys,
  UserFactory,
} from "@openforis/arena-core";

import {
  buildCoordinateAttributeFeatures,
  buildSamplingPointFeatures,
  getAvailableLayers,
  getDefaultVisibleLayerKeys,
  getRecordUuidsBySamplingPointItemUuid,
  hasMapLayers,
  RecordsMapLayerType,
} from "./recordsMapLayers";

const { category, categoryItem, codeDef, coordinateDef, entityDef } =
  SurveyObjectBuilders;

const location = (x: number, y: number) => `SRID=EPSG:4326;POINT(${x} ${y})`;

const buildSurvey = (): Promise<Survey> =>
  new SurveyBuilder(
    UserFactory.createInstance({ email: "test@openforis.org", name: "test" }),
    entityDef(
      "cluster",
      codeDef("cluster_id", "sampling_point_data").key(),
      coordinateDef("cluster_location"),
      entityDef(
        "plot",
        codeDef("plot_id", "sampling_point_data").parentCodeAttribute(
          "cluster_id",
        ),
        coordinateDef("plot_location"),
      ).multiple(),
    ),
  )
    .categories(
      category("sampling_point_data")
        .levels("cluster", "plot")
        .extraProps({
          location: {
            key: "location",
            dataType: "geometryPoint" as ExtraPropDataType,
          },
        })
        .items(
          categoryItem("1")
            .extra({ location: location(10, 20) })
            .items(
              categoryItem("1").extra({ location: location(10.1, 20.1) }),
              categoryItem("2").extra({ location: location(10.2, 20.2) }),
            ),
          categoryItem("2")
            .extra({ location: location(11, 21) })
            .items(categoryItem("1").extra({ location: location(11.1, 21.1) })),
          // without location: not shown on the map
          categoryItem("3"),
        ),
    )
    .build();

const findItemUuid = (survey: Survey, codePaths: string[]) =>
  Surveys.getCategoryItemByCodePaths({
    survey,
    categoryUuid: Surveys.getCategoryByName({
      survey,
      categoryName: "sampling_point_data",
    })!.uuid,
    codePaths,
  })!.uuid;

describe("recordsMapLayers", () => {
  let survey: Survey;
  const cycle = "0";

  beforeAll(async () => {
    survey = await buildSurvey();
  });

  test("map layers available only with sampling point locations or coordinate attributes", async () => {
    expect(hasMapLayers({ survey, cycle })).toBe(true);

    const user = UserFactory.createInstance({
      email: "test@openforis.org",
      name: "test",
    });
    const surveyWithoutLayers = await new SurveyBuilder(
      user,
      entityDef("cluster", codeDef("cluster_id", "sampling_point_data").key()),
    )
      // sampling point data without location
      .categories(category("sampling_point_data").items(categoryItem("1")))
      .build();
    expect(hasMapLayers({ survey: surveyWithoutLayers, cycle })).toBe(false);
  });

  test("a layer for each sampling point level and coordinate attribute", () => {
    const layers = getAvailableLayers({ survey, cycle });
    expect(layers.map((layer) => [layer.type, layer.levelIndex])).toEqual([
      [RecordsMapLayerType.samplingPoints, 0],
      [RecordsMapLayerType.samplingPoints, 1],
      [RecordsMapLayerType.coordinateAttribute, undefined],
      [RecordsMapLayerType.coordinateAttribute, undefined],
    ]);
  });

  test("sampling points referenced by record keys are visited", () => {
    const recordUuidsByItemUuid = getRecordUuidsBySamplingPointItemUuid({
      survey,
      cycle,
      recordSummaries: [
        // local record: key stored as item uuid
        {
          uuid: "record-1",
          keysObj: { cluster_id: { itemUuid: findItemUuid(survey, ["1"]) } },
        },
        // remote record summary: key stored as code
        { uuid: "record-2", keysObj: { cluster_id: "2" } },
        { uuid: "record-3", keysObj: { cluster_id: "not-existing" } },
      ],
    });
    const [clusterLayer] = getAvailableLayers({ survey, cycle });
    const features = buildSamplingPointFeatures({
      survey,
      layer: clusterLayer!,
      recordUuidsByItemUuid,
    });
    expect(
      features.map(({ geometry, properties }) => ({
        coordinates: geometry.coordinates,
        label: properties.label,
        recordUuids: properties.recordUuids,
        visited: properties.visited,
      })),
    ).toEqual([
      {
        coordinates: [10, 20],
        label: "1",
        recordUuids: ["record-1"],
        visited: true,
      },
      {
        coordinates: [11, 21],
        label: "2",
        recordUuids: ["record-2"],
        visited: true,
      },
    ]);
  });

  test("sampling points of the second level are labelled with the code path", () => {
    const [, plotLayer] = getAvailableLayers({ survey, cycle });
    const features = buildSamplingPointFeatures({
      survey,
      layer: plotLayer!,
      recordUuidsByItemUuid: {},
    });
    expect(features.map((feature) => feature.properties.label)).toEqual([
      "1 - 1",
      "1 - 2",
      "2 - 1",
    ]);
    expect(features.every((feature) => !feature.properties.visited)).toBe(true);
  });

  test("coordinate attribute values of known records become points", () => {
    const layers = getAvailableLayers({ survey, cycle });
    const plotLocationLayer = layers.find(
      (layer) =>
        layer.nodeDefUuid ===
        Surveys.getNodeDefByName({ survey, name: "plot_location" }).uuid,
    )!;
    const features = buildCoordinateAttributeFeatures({
      survey,
      layer: plotLocationLayer,
      nodeValues: [
        {
          recordUuid: "record-1",
          nodeDefUuid: plotLocationLayer.nodeDefUuid!,
          value: { x: 12, y: 22, srs: "4326" },
        },
        // record not in the current cycle
        {
          recordUuid: "record-other",
          nodeDefUuid: plotLocationLayer.nodeDefUuid!,
          value: { x: 13, y: 23, srs: "4326" },
        },
        // empty value
        {
          recordUuid: "record-1",
          nodeDefUuid: plotLocationLayer.nodeDefUuid!,
          value: { x: null, y: null, srs: "4326" },
        },
      ],
      recordLabelByUuid: { "record-1": "1" },
    });
    expect(features).toHaveLength(1);
    expect(features[0]!.geometry.coordinates).toEqual([12, 22]);
    expect(features[0]!.properties.recordUuids).toEqual(["record-1"]);
  });

  test("by default only the first sampling point level and its coordinate attributes are visible", () => {
    const layers = getAvailableLayers({ survey, cycle });
    const clusterLocationDefUuid = Surveys.getNodeDefByName({
      survey,
      name: "cluster_location",
    }).uuid;
    const visibleLayerKeys = getDefaultVisibleLayerKeys({
      survey,
      cycle,
      layers,
    });
    expect(
      visibleLayerKeys.map((key) => layers.find((layer) => layer.key === key)!),
    ).toEqual([
      expect.objectContaining({
        type: RecordsMapLayerType.samplingPoints,
        levelIndex: 0,
      }),
      expect.objectContaining({ nodeDefUuid: clusterLocationDefUuid }),
    ]);
  });
});
