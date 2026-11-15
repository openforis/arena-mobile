import { useCallback, useMemo, useState } from "react";

import { useSurveyMapLayersGeometries } from "hooks/useSurveyMapLayersGeometries";
import { SurveySelectors } from "state/survey/selectors";
import {
  MapLayerFileGeometries,
  MapLayerFileParser,
} from "utils/MapLayerFileParser";

import {
  getSurveyMapLayers,
  SurveyMapLayer,
  SurveyMapLayerType,
} from "./surveyMapLayers";

export type SurveyMapLayerWithGeometries = {
  layer: SurveyMapLayer;
  geometries: MapLayerFileGeometries;
};

const getLayerIdsOfType = (
  layers: SurveyMapLayer[],
  type: SurveyMapLayerType,
): string[] =>
  layers.filter((layer) => layer.type === type).map((layer) => layer.id);

// layers of the current survey, all hidden at first; loaded only when shown
export const useSurveyMapLayers = () => {
  const survey = SurveySelectors.useCurrentSurvey();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();

  const layers = useMemo(
    () => getSurveyMapLayers({ survey, lang }),
    [lang, survey],
  );

  const [visibleLayerKeys, setVisibleLayerKeys] = useState<string[]>([]);

  const toggleLayer = useCallback((layerKey: string) => {
    setVisibleLayerKeys((keysPrev) =>
      keysPrev.includes(layerKey)
        ? keysPrev.filter((key) => key !== layerKey)
        : [...keysPrev, layerKey],
    );
  }, []);

  const visibleLayers = useMemo(
    () => layers.filter((layer) => visibleLayerKeys.includes(layer.key)),
    [layers, visibleLayerKeys],
  );

  const visibleAreaNames = useMemo(
    () => getLayerIdsOfType(visibleLayers, SurveyMapLayerType.areaOfInterest),
    [visibleLayers],
  );

  const visiblePreloadedFileUuids = useMemo(
    () =>
      getLayerIdsOfType(visibleLayers, SurveyMapLayerType.preloadedMapLayer),
    [visibleLayers],
  );

  const { areaOfInterestByName, preloadedGeometriesByFileUuid } =
    useSurveyMapLayersGeometries({
      survey,
      lang,
      areaNames: visibleAreaNames,
      preloadedFileUuids: visiblePreloadedFileUuids,
    });

  const visibleLayersWithGeometries = useMemo(
    (): SurveyMapLayerWithGeometries[] =>
      visibleLayers.flatMap((layer) => {
        if (layer.type === SurveyMapLayerType.areaOfInterest) {
          const areaOfInterest = areaOfInterestByName[layer.id];
          // area files are GeoJSON Polygon or MultiPolygon geometries
          return areaOfInterest
            ? [
                {
                  layer,
                  geometries: MapLayerFileParser.parseGeoJson(areaOfInterest),
                },
              ]
            : [];
        }
        const geometries = preloadedGeometriesByFileUuid[layer.id];
        return geometries ? [{ layer, geometries }] : [];
      }),
    [areaOfInterestByName, preloadedGeometriesByFileUuid, visibleLayers],
  );

  return { layers, visibleLayerKeys, toggleLayer, visibleLayersWithGeometries };
};
