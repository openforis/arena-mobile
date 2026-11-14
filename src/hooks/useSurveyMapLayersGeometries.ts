import { useCallback } from "react";

import { AreaOfInterest, LanguageCode, Survey } from "@openforis/arena-core";

import { SurveyDefs } from "model/utils/SurveyDefs";
import { AreaOfInterestProviderDefault } from "service/areaOfInterestProvider";
import { PreloadedMapLayerService } from "service/preloadedMapLayerService";
import type { MapLayerFileGeometries } from "utils/MapLayerFileParser";

import { useLazyLoadedByKey } from "./useLazyLoadedByKey";
import { useToast } from "./useToast";

// areas of interest and preloaded map layers of the survey, loaded only when requested (e.g. when their layer is shown), once
export const useSurveyMapLayersGeometries = ({
  survey,
  lang,
  areaNames,
  preloadedFileUuids,
}: {
  survey: Survey | null | undefined;
  lang: LanguageCode;
  // memoized: a new array triggers the loading of the values not requested yet
  areaNames: string[];
  preloadedFileUuids: string[];
}): {
  areaOfInterestByName: Record<string, AreaOfInterest | null>;
  preloadedGeometriesByFileUuid: Record<string, MapLayerFileGeometries | null>;
} => {
  const toaster = useToast();

  const loadAreaOfInterest = useCallback(
    async (name: string) =>
      survey
        ? AreaOfInterestProviderDefault.getAreaOfInterest({ survey, name })
        : undefined,
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

  const areaOfInterestByName = useLazyLoadedByKey({
    keys: areaNames,
    load: loadAreaOfInterest,
    onNotAvailable: onAreasOfInterestNotAvailable,
  });

  const loadPreloadedMapLayer = useCallback(
    async (fileUuid: string) => {
      if (!survey) return undefined;
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
      if (!survey) return;
      const names = SurveyDefs.getPreloadedMapLayers(survey)
        .filter(({ uuid }) => fileUuids.includes(uuid))
        .map(({ props }) => props.labels?.[lang] || props.name);
      toaster("recordsMap:preloadedMapLayerNotAvailable", {
        names: names.join(", "),
      });
    },
    [lang, survey, toaster],
  );

  const preloadedGeometriesByFileUuid = useLazyLoadedByKey({
    keys: preloadedFileUuids,
    load: loadPreloadedMapLayer,
    onNotAvailable: onPreloadedMapLayersNotAvailable,
  });

  return { areaOfInterestByName, preloadedGeometriesByFileUuid };
};
