import { LanguageCode, ArenaSurvey } from "@openforis/arena-core";

import { getSurveyMapLayers, SurveyMapLayerType } from "./surveyMapLayers";

const buildSurvey = ({
  preloadedMapLayersEnabled = true,
}: { preloadedMapLayersEnabled?: boolean } = {}): ArenaSurvey =>
  ({
    props: {
      areasOfInterest: [
        { name: "area_1", labels: { en: "Area 1" }, fileUuid: "aoi-file-1" },
        { name: "area_2", labels: {}, fileUuid: "aoi-file-2" },
      ],
      preloadedMapLayersEnabled,
      preloadedMapLayers: [
        { uuid: "f1", props: { name: "f1.kml", labels: { en: "Layer 1" } } },
        { uuid: "f2", props: { name: "f2.kml", deleted: true } },
        { uuid: "f3", props: { name: "f3.geojson" } },
      ],
    },
  }) as unknown as ArenaSurvey;

describe("getSurveyMapLayers", () => {
  test("no layers without a survey", () => {
    expect(getSurveyMapLayers({ survey: null, lang: LanguageCode.en })).toEqual(
      [],
    );
  });

  test("areas of interest and preloaded map layers not deleted, labelled in the survey language or by name", () => {
    const layers = getSurveyMapLayers({
      survey: buildSurvey(),
      lang: LanguageCode.en,
    });
    expect(
      layers.map(({ key, type, id, label }) => ({ key, type, id, label })),
    ).toEqual([
      {
        key: "areaOfInterest_area_1",
        type: SurveyMapLayerType.areaOfInterest,
        id: "area_1",
        label: "Area 1",
      },
      {
        key: "areaOfInterest_area_2",
        type: SurveyMapLayerType.areaOfInterest,
        id: "area_2",
        label: "area_2",
      },
      {
        key: "preloadedMapLayer_f1",
        type: SurveyMapLayerType.preloadedMapLayer,
        id: "f1",
        label: "Layer 1",
      },
      {
        key: "preloadedMapLayer_f3",
        type: SurveyMapLayerType.preloadedMapLayer,
        id: "f3",
        label: "f3.geojson",
      },
    ]);
    expect(new Set(layers.map((layer) => layer.color)).size).toBe(4);
  });

  test("preloaded map layers only when enabled in the survey", () => {
    const layers = getSurveyMapLayers({
      survey: buildSurvey({ preloadedMapLayersEnabled: false }),
      lang: LanguageCode.en,
    });
    expect(layers.map((layer) => layer.type)).toEqual([
      SurveyMapLayerType.areaOfInterest,
      SurveyMapLayerType.areaOfInterest,
    ]);
  });
});
