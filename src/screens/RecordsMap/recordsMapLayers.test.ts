import {
  ExtraPropDataType,
  LanguageCode,
  NodeDefType,
  Survey,
  SurveyBuilder,
  SurveyObjectBuilders,
  Surveys,
  UserFactory,
} from "@openforis/arena-core";

import {
  buildAreaOfInterestPolygons,
  buildCoordinateAttributeFeatures,
  buildPreloadedMapLayerShapes,
  buildSamplingPointFeatures,
  buildTrackFeatures,
  getAvailableLayers,
  getDefaultVisibleLayerKeys,
  getLayerLabel,
  getRecordUuidsBySamplingPointItemUuid,
  groupLayerItemsByType,
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

  describe("position tracks", () => {
    let surveyWithTrack: Survey;

    beforeAll(async () => {
      surveyWithTrack = await buildSurvey();
      // no geo attribute builder: turn a coordinate attribute into a tracking geo attribute
      const trackDef = Surveys.getNodeDefByName({
        survey: surveyWithTrack,
        name: "cluster_location",
      }) as any;
      trackDef.type = NodeDefType.geo;
      trackDef.props.positionTracking = true;
    });

    const getTrackLayer = () =>
      getAvailableLayers({ survey: surveyWithTrack, cycle }).find(
        (layer) => layer.type === RecordsMapLayerType.positionTrack,
      )!;

    test("a layer for each tracking geo attribute, hidden by default", () => {
      const trackLayer = getTrackLayer();
      expect(trackLayer).toBeDefined();
      const layers = getAvailableLayers({ survey: surveyWithTrack, cycle });
      expect(
        getDefaultVisibleLayerKeys({ survey: surveyWithTrack, cycle, layers }),
      ).not.toContain(trackLayer.key);
    });

    test("track values of known records become track features", () => {
      const trackLayer = getTrackLayer();
      const value = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "MultiLineString",
          coordinates: [
            [
              [10, 20],
              [10.001, 20.001],
            ],
            // single position line: skipped
            [[10.002, 20.002]],
          ],
        },
      };
      const features = buildTrackFeatures({
        layer: trackLayer,
        nodeValues: [
          {
            recordUuid: "record-1",
            nodeDefUuid: trackLayer.nodeDefUuid!,
            value,
          },
          {
            recordUuid: "record-other",
            nodeDefUuid: trackLayer.nodeDefUuid!,
            value,
          },
          // polygon value: not a track
          {
            recordUuid: "record-1",
            nodeDefUuid: trackLayer.nodeDefUuid!,
            value: { geometry: { type: "Polygon", coordinates: [] } },
          },
        ],
        recordLabelByUuid: { "record-1": "1" },
      });
      expect(features).toHaveLength(1);
      expect(features[0]!.lines).toEqual([
        [
          { latitude: 20, longitude: 10 },
          { latitude: 20.001, longitude: 10.001 },
        ],
      ]);
      expect(features[0]!.point).toMatchObject({ x: 10, y: 20 });
    });
  });

  describe("areas of interest", () => {
    const withAreasOfInterest = (survey: Survey): Survey => ({
      ...survey,
      props: {
        ...survey.props,
        areasOfInterest: [
          {
            name: "area_1",
            labels: { en: "Area 1" },
            fileUuid: "file-1",
            fileName: "area_1.geojson",
            size: 0,
            polygons: 1,
            vertices: 4,
          },
        ],
      },
    });

    const getAreaLayer = (survey: Survey) =>
      getAvailableLayers({ survey, cycle }).find(
        (layer) => layer.type === RecordsMapLayerType.areaOfInterest,
      )!;

    test("a layer for each area of interest, labelled in the survey language, hidden by default", async () => {
      const surveyWithAreas = withAreasOfInterest(survey);
      const areaLayer = getAreaLayer(surveyWithAreas);
      expect(areaLayer.areaName).toBe("area_1");
      const layers = getAvailableLayers({ survey: surveyWithAreas, cycle });
      expect(
        getDefaultVisibleLayerKeys({ survey: surveyWithAreas, cycle, layers }),
      ).not.toContain(areaLayer.key);
      const t = (key: string, params?: any) => `${key} ${params?.name}`;
      expect(
        getLayerLabel({
          survey: surveyWithAreas,
          layer: areaLayer,
          lang: LanguageCode.en,
          t,
        }),
      ).toBe("recordsMap:areaOfInterestLayer Area 1");
      expect(
        getLayerLabel({
          survey: surveyWithAreas,
          layer: areaLayer,
          lang: LanguageCode.fr,
          t,
        }),
      ).toBe("recordsMap:areaOfInterestLayer area_1");
      expect(
        getLayerLabel({
          survey: surveyWithAreas,
          layer: areaLayer,
          lang: LanguageCode.en,
          t,
          inGroup: true,
        }),
      ).toBe("Area 1");

      const surveyWithAreasOnly = withAreasOfInterest(
        await new SurveyBuilder(
          UserFactory.createInstance({
            email: "test@openforis.org",
            name: "test",
          }),
          entityDef("cluster", codeDef("cluster_id", "cluster_ids").key()),
        )
          .categories(category("cluster_ids").items(categoryItem("1")))
          .build(),
      );
      expect(hasMapLayers({ survey: surveyWithAreasOnly, cycle })).toBe(true);
    });

    test("polygons and multi polygons become map polygons with holes", () => {
      const areaLayer = getAreaLayer(withAreasOfInterest(survey));
      const ring = (x: number, y: number) => [
        [x, y],
        [x + 1, y],
        [x + 1, y + 1],
        [x, y],
      ];
      const toLatLngs = (positions: number[][]) =>
        positions.map(([longitude, latitude]) => ({ latitude, longitude }));

      expect(
        buildAreaOfInterestPolygons({
          layer: areaLayer,
          areaOfInterest: {
            type: "Polygon",
            coordinates: [ring(0, 0), ring(0.2, 0.2)],
          },
        }),
      ).toEqual([
        {
          key: `${areaLayer.key}_0`,
          coordinates: toLatLngs(ring(0, 0)),
          holes: [toLatLngs(ring(0.2, 0.2))],
        },
      ]);

      const polygons = buildAreaOfInterestPolygons({
        layer: areaLayer,
        areaOfInterest: {
          type: "MultiPolygon",
          coordinates: [
            [ring(0, 0)],
            // invalid positions are skipped: too few left for a polygon
            [[[10, 10], [Number.NaN, 10], [11, 11] as any]],
            [ring(20, 20)],
          ],
        },
      });
      expect(polygons.map((polygon) => polygon.key)).toEqual([
        `${areaLayer.key}_0`,
        `${areaLayer.key}_2`,
      ]);
      expect(polygons[1]!.coordinates).toEqual(toLatLngs(ring(20, 20)));
    });
  });

  describe("preloaded map layers", () => {
    const preloadedFile = (uuid: string, deleted = false) => ({
      uuid,
      dateCreated: "2026-01-01",
      props: { name: `${uuid}.kml`, labels: { en: `Layer ${uuid}` }, deleted },
    });

    const withPreloadedMapLayers = (
      survey: Survey,
      enabled = true,
    ): Survey => ({
      ...survey,
      props: {
        ...survey.props,
        preloadedMapLayersEnabled: enabled,
        preloadedMapLayers: [preloadedFile("f1"), preloadedFile("f2", true)],
      },
    });

    const getPreloadedLayers = (survey: Survey) =>
      getAvailableLayers({ survey, cycle }).filter(
        (layer) => layer.type === RecordsMapLayerType.preloadedMapLayer,
      );

    test("a layer for each file not deleted, only when enabled, hidden by default", () => {
      expect(
        getPreloadedLayers(withPreloadedMapLayers(survey, false)),
      ).toHaveLength(0);
      const surveyWithLayers = withPreloadedMapLayers(survey);
      const layers = getPreloadedLayers(surveyWithLayers);
      expect(layers.map((layer) => layer.fileUuid)).toEqual(["f1"]);
      expect(
        getDefaultVisibleLayerKeys({
          survey: surveyWithLayers,
          cycle,
          layers: getAvailableLayers({ survey: surveyWithLayers, cycle }),
        }),
      ).not.toContain(layers[0]!.key);
      const t = (key: string, params?: any) => `${key} ${params?.name}`;
      expect(
        getLayerLabel({
          survey: surveyWithLayers,
          layer: layers[0]!,
          lang: LanguageCode.en,
          t,
        }),
      ).toBe("recordsMap:preloadedMapLayer Layer f1");
      expect(
        getLayerLabel({
          survey: surveyWithLayers,
          layer: layers[0]!,
          lang: LanguageCode.fr,
          t,
        }),
      ).toBe("recordsMap:preloadedMapLayer f1.kml");
      expect(
        getLayerLabel({
          survey: surveyWithLayers,
          layer: layers[0]!,
          lang: LanguageCode.en,
          t,
          inGroup: true,
        }),
      ).toBe("Layer f1");
    });

    test("file geometries become map points, lines and polygons", () => {
      const layer = getPreloadedLayers(withPreloadedMapLayers(survey))[0]!;
      const square = [
        { latitude: 0, longitude: 0 },
        { latitude: 0, longitude: 1 },
        { latitude: 1, longitude: 1 },
      ];
      const shapes = buildPreloadedMapLayerShapes({
        layer,
        geometries: {
          points: [
            { name: "P1", coordinate: { latitude: 20, longitude: 10 } },
            { coordinate: { latitude: 21, longitude: 11 } },
          ],
          lines: [{ coordinates: square }],
          polygons: [{ coordinates: square, holes: [] }],
        },
      });
      expect(shapes.points.map((point) => point.properties)).toEqual([
        expect.objectContaining({
          label: "P1",
          layerKey: layer.key,
          recordUuids: [],
          point: { x: 10, y: 20, srs: "4326" },
        }),
        expect.objectContaining({ label: "" }),
      ]);
      expect(shapes.lines).toEqual([
        { key: `${layer.key}_line_0`, coordinates: square },
      ]);
      expect(shapes.polygons).toEqual([
        { key: `${layer.key}_polygon_0`, coordinates: square, holes: [] },
      ]);
    });
  });

  test("layers are grouped by type, in the order of the layers", () => {
    const layers = getAvailableLayers({ survey, cycle });
    const groups = groupLayerItemsByType(layers.map((layer) => ({ layer })));
    expect(groups.map(({ type }) => type)).toEqual([
      ...new Set(layers.map(({ type }) => type)),
    ]);
    expect(
      groups.flatMap(({ items }) => items.map(({ layer }) => layer)),
    ).toEqual(layers);
    expect(groups[0]!.titleKey).toBe("recordsMap:layerGroup.samplingPoints");
  });
});
