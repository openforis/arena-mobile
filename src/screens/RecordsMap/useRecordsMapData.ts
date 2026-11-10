import { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { useToast } from "hooks";
import { useTranslation } from "localization";
import { LatLng, RecordUtils, SurveyDefs } from "model";
import { RecordService } from "service";
import { AreaOfInterestProviderDefault } from "service/areaOfInterestProvider";
import { PreloadedMapLayerService } from "service/preloadedMapLayerService";
import { SurveySelectors } from "state";

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
  RecordsMapAreaPolygon,
  RecordsMapLayer,
  RecordsMapLayerType,
  RecordsMapPointFeature,
  RecordsMapPreloadedLayerShapes,
  RecordsMapTrackFeature,
} from "./recordsMapLayers";
import { useLazyLoadedByKey } from "./useLazyLoadedByKey";

type NodeValue = { recordUuid: string; nodeDefUuid: string; value: any };

type DataState = {
  loading: boolean;
  recordSummaries: any[];
  nodeValues: NodeValue[];
};

// bounding box corners (to fit the map without passing all the points of tracks and areas)
const getBoundsCorners = (coordinates: LatLng[]): LatLng[] => {
  if (coordinates.length === 0) return [];
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;
  for (const { latitude, longitude } of coordinates) {
    minLat = Math.min(minLat, latitude);
    maxLat = Math.max(maxLat, latitude);
    minLng = Math.min(minLng, longitude);
    maxLng = Math.max(maxLng, longitude);
  }
  return [
    { latitude: minLat, longitude: minLng },
    { latitude: maxLat, longitude: maxLng },
  ];
};

const toLatLng = (feature: RecordsMapPointFeature): LatLng => {
  const [longitude, latitude] = feature.geometry.coordinates;
  return { latitude, longitude };
};

const getVisibleLayersOfType = ({
  layers,
  visibleLayerKeys,
  type,
}: {
  layers: RecordsMapLayer[];
  visibleLayerKeys: string[];
  type: RecordsMapLayerType;
}) =>
  layers.filter(
    (layer) => layer.type === type && visibleLayerKeys.includes(layer.key),
  );

export const useRecordsMapData = () => {
  const { t } = useTranslation();
  const toaster = useToast();
  const survey = SurveySelectors.useCurrentSurvey()!;
  const cycle = SurveySelectors.useCurrentSurveyCycle()!;
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();

  const [dataState, setDataState] = useState<DataState>({
    loading: true,
    recordSummaries: [],
    nodeValues: [],
  });
  const { loading, recordSummaries, nodeValues } = dataState;

  const layers = useMemo(
    () => getAvailableLayers({ survey, cycle }),
    [cycle, survey],
  );

  const [visibleLayerKeys, setVisibleLayerKeys] = useState<string[]>(() =>
    getDefaultVisibleLayerKeys({ survey, cycle, layers }),
  );

  const toggleLayer = useCallback((layerKey: string) => {
    setVisibleLayerKeys((keysPrev) =>
      keysPrev.includes(layerKey)
        ? keysPrev.filter((key) => key !== layerKey)
        : [...keysPrev, layerKey],
    );
  }, []);

  const loadData = useCallback(async () => {
    try {
      // local records plus the summaries of the remote ones fetched with the last sync status check
      const _recordSummaries = await RecordService.fetchRecords({
        survey,
        cycle,
        onlyLocal: false,
      });
      // tracks are loaded only when their layer is visible (see trackValues)
      const coordinateDefUuids = layers
        .filter(
          (layer) => layer.type === RecordsMapLayerType.coordinateAttribute,
        )
        .map((layer) => layer.nodeDefUuid!);
      const _nodeValues = await RecordService.fetchNodeValuesByDefUuids({
        surveyId: survey.id!,
        cycle,
        nodeDefUuids: coordinateDefUuids,
      });
      setDataState({
        loading: false,
        recordSummaries: _recordSummaries,
        nodeValues: _nodeValues,
      });
    } catch (error) {
      setDataState((statePrev) => ({ ...statePrev, loading: false }));
      toaster("recordsMap:errorLoadingData", { details: String(error) });
    }
  }, [cycle, layers, survey, toaster]);

  // incremented on focus, to reload the tracks too
  const [focusCount, setFocusCount] = useState(0);

  // (re)load data on focus, e.g. when coming back from the record editor
  useFocusEffect(
    useCallback(() => {
      void loadData();
      setFocusCount((countPrev) => countPrev + 1);
    }, [loadData]),
  );

  const visibleTrackDefUuidsJoint = useMemo(
    () =>
      getVisibleLayersOfType({
        layers,
        visibleLayerKeys,
        type: RecordsMapLayerType.positionTrack,
      })
        .map((layer) => layer.nodeDefUuid!)
        .join(","),
    [layers, visibleLayerKeys],
  );

  // values of hidden track layers are kept but not shown (see tracksByLayerKey)
  const [trackValues, setTrackValues] = useState<NodeValue[]>([]);

  useEffect(() => {
    if (!visibleTrackDefUuidsJoint) return;
    let cancelled = false;
    RecordService.fetchNodeValuesByDefUuids({
      surveyId: survey.id!,
      cycle,
      nodeDefUuids: visibleTrackDefUuidsJoint.split(","),
    })
      .then((values) => {
        if (!cancelled) setTrackValues(values);
      })
      .catch((error) => {
        toaster("recordsMap:errorLoadingData", { details: String(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [cycle, focusCount, survey.id, toaster, visibleTrackDefUuidsJoint]);

  const visibleAreaNames = useMemo(
    () =>
      getVisibleLayersOfType({
        layers,
        visibleLayerKeys,
        type: RecordsMapLayerType.areaOfInterest,
      }).map((layer) => layer.areaName!),
    [layers, visibleLayerKeys],
  );

  const loadAreaOfInterest = useCallback(
    (name: string) =>
      AreaOfInterestProviderDefault.getAreaOfInterest({ survey, name }),
    [survey],
  );

  const onAreasOfInterestNotAvailable = useCallback(
    (names: string[]) => {
      toaster("recordsMap:areaOfInterestNotAvailable", {
        names: names.join(", "),
      });
    },
    [toaster],
  );

  // areas are loaded only when their layer is visible, once (survey files never change)
  const areaOfInterestByName = useLazyLoadedByKey({
    keys: visibleAreaNames,
    load: loadAreaOfInterest,
    onNotAvailable: onAreasOfInterestNotAvailable,
  });

  const visiblePreloadedFileUuids = useMemo(
    () =>
      getVisibleLayersOfType({
        layers,
        visibleLayerKeys,
        type: RecordsMapLayerType.preloadedMapLayer,
      }).map((layer) => layer.fileUuid!),
    [layers, visibleLayerKeys],
  );

  const loadPreloadedMapLayer = useCallback(
    async (fileUuid: string) => {
      const file = SurveyDefs.getPreloadedMapLayers(survey).find(
        ({ uuid }) => uuid === fileUuid,
      );
      return file
        ? PreloadedMapLayerService.readPreloadedMapLayer({ survey, file })
        : undefined;
    },
    [survey],
  );

  const onPreloadedMapLayersNotAvailable = useCallback(
    (fileUuids: string[]) => {
      const names = SurveyDefs.getPreloadedMapLayers(survey)
        .filter(({ uuid }) => fileUuids.includes(uuid))
        .map(({ props }) => props.labels?.[lang] || props.name);
      toaster("recordsMap:preloadedMapLayerNotAvailable", {
        names: names.join(", "),
      });
    },
    [lang, survey, toaster],
  );

  // preloaded layers are loaded only when visible, once (survey files never change)
  const preloadedGeometriesByFileUuid = useLazyLoadedByKey({
    keys: visiblePreloadedFileUuids,
    load: loadPreloadedMapLayer,
    onNotAvailable: onPreloadedMapLayersNotAvailable,
  });

  const preloadedShapesByLayerKey = useMemo(
    () =>
      layers.reduce(
        (acc, layer) => {
          const geometries =
            layer.type === RecordsMapLayerType.preloadedMapLayer
              ? preloadedGeometriesByFileUuid[layer.fileUuid!]
              : null;
          if (geometries) {
            acc[layer.key] = buildPreloadedMapLayerShapes({
              layer,
              geometries,
            });
          }
          return acc;
        },
        {} as Record<string, RecordsMapPreloadedLayerShapes>,
      ),
    [layers, preloadedGeometriesByFileUuid],
  );

  const recordSummaryByUuid = useMemo(
    () =>
      recordSummaries.reduce(
        (acc, recordSummary) => {
          acc[recordSummary.uuid] = recordSummary;
          return acc;
        },
        {} as Record<string, any>,
      ),
    [recordSummaries],
  );

  const recordLabelByUuid = useMemo(
    () =>
      recordSummaries.reduce(
        (acc, recordSummary) => {
          const keyValues = RecordUtils.getRecordSummaryValuesByKeyFormatted({
            survey,
            lang,
            recordSummary,
            t,
          });
          acc[recordSummary.uuid] = Object.values(keyValues).join(" - ");
          return acc;
        },
        {} as Record<string, string>,
      ),
    [lang, recordSummaries, survey, t],
  );

  const pointsByLayerKey = useMemo(() => {
    const recordUuidsByItemUuid = getRecordUuidsBySamplingPointItemUuid({
      survey,
      cycle,
      recordSummaries,
    });
    return layers.reduce(
      (acc, layer) => {
        if (layer.type === RecordsMapLayerType.samplingPoints) {
          acc[layer.key] = buildSamplingPointFeatures({
            survey,
            layer,
            recordUuidsByItemUuid,
          });
        } else if (layer.type === RecordsMapLayerType.coordinateAttribute) {
          acc[layer.key] = buildCoordinateAttributeFeatures({
            survey,
            layer,
            nodeValues,
            recordLabelByUuid,
          });
        } else if (preloadedShapesByLayerKey[layer.key]) {
          acc[layer.key] = preloadedShapesByLayerKey[layer.key]!.points;
        }
        return acc;
      },
      {} as Record<string, RecordsMapPointFeature[]>,
    );
  }, [
    cycle,
    layers,
    nodeValues,
    preloadedShapesByLayerKey,
    recordLabelByUuid,
    recordSummaries,
    survey,
  ]);

  const tracksByLayerKey = useMemo(
    () =>
      layers.reduce(
        (acc, layer) => {
          // hidden track layers: no entry, so their count is not shown
          if (
            layer.type === RecordsMapLayerType.positionTrack &&
            visibleLayerKeys.includes(layer.key)
          ) {
            acc[layer.key] = buildTrackFeatures({
              layer,
              nodeValues: trackValues,
              recordLabelByUuid,
            });
          }
          return acc;
        },
        {} as Record<string, RecordsMapTrackFeature[]>,
      ),
    [layers, recordLabelByUuid, trackValues, visibleLayerKeys],
  );

  const areaPolygonsByLayerKey = useMemo(
    () =>
      layers.reduce(
        (acc, layer) => {
          const areaOfInterest =
            layer.type === RecordsMapLayerType.areaOfInterest
              ? areaOfInterestByName[layer.areaName!]
              : null;
          if (areaOfInterest) {
            acc[layer.key] = buildAreaOfInterestPolygons({
              layer,
              areaOfInterest,
            });
          } else if (preloadedShapesByLayerKey[layer.key]) {
            acc[layer.key] = preloadedShapesByLayerKey[layer.key]!.polygons;
          }
          return acc;
        },
        {} as Record<string, RecordsMapAreaPolygon[]>,
      ),
    [areaOfInterestByName, layers, preloadedShapesByLayerKey],
  );

  const layerLabelByKey = useMemo(
    () =>
      layers.reduce(
        (acc, layer) => {
          acc[layer.key] = getLayerLabel({ survey, layer, lang, t });
          return acc;
        },
        {} as Record<string, string>,
      ),
    [lang, layers, survey, t],
  );

  const visibleLayers = useMemo(
    () => layers.filter((layer) => visibleLayerKeys.includes(layer.key)),
    [layers, visibleLayerKeys],
  );

  const visibleCoordinates = useMemo(
    () =>
      visibleLayers.flatMap((layer) => [
        ...(pointsByLayerKey[layer.key] ?? []).map(toLatLng),
        ...(tracksByLayerKey[layer.key] ?? []).flatMap((track) =>
          getBoundsCorners(track.lines.flat()),
        ),
        ...getBoundsCorners(
          (areaPolygonsByLayerKey[layer.key] ?? []).flatMap(
            (polygon) => polygon.coordinates,
          ),
        ),
        ...getBoundsCorners(
          (preloadedShapesByLayerKey[layer.key]?.lines ?? []).flatMap(
            (line) => line.coordinates,
          ),
        ),
      ]),
    [
      areaPolygonsByLayerKey,
      pointsByLayerKey,
      preloadedShapesByLayerKey,
      tracksByLayerKey,
      visibleLayers,
    ],
  );

  return {
    loading,
    layers,
    visibleLayers,
    visibleLayerKeys,
    toggleLayer,
    recordSummaryByUuid,
    recordLabelByUuid,
    layerLabelByKey,
    pointsByLayerKey,
    tracksByLayerKey,
    areaPolygonsByLayerKey,
    preloadedShapesByLayerKey,
    visibleCoordinates,
  };
};
