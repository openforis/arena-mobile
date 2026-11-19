import { LanguageCode, ArenaSurvey, Surveys } from "@openforis/arena-core";

import { SurveyDefs } from "model/utils/SurveyDefs";

export enum SurveyMapLayerType {
  areaOfInterest = "areaOfInterest",
  preloadedMapLayer = "preloadedMapLayer",
}

export type SurveyMapLayer = {
  key: string;
  type: SurveyMapLayerType;
  // area of interest name or preloaded map layer file uuid
  id: string;
  label: string;
  color: string;
};

// no red and blue: used by the markers, tracks and polygons of the screens
const layerColors = [
  "#8e24aa",
  "#fb8c00",
  "#00897b",
  "#d81b60",
  "#c0ca33",
  "#6d4c41",
];

// areas of interest and preloaded map layers of the survey, that can be shown in every map
export const getSurveyMapLayers = ({
  survey,
  lang,
}: {
  survey: ArenaSurvey | null | undefined;
  lang: LanguageCode;
}): SurveyMapLayer[] => {
  if (!survey) return [];
  const areaLayers = Surveys.getAreasOfInterest(survey).map(
    ({ name, labels }) => ({
      type: SurveyMapLayerType.areaOfInterest,
      id: name,
      label: labels?.[lang] || name,
    }),
  );
  const preloadedLayers = SurveyDefs.getPreloadedMapLayers(survey).map(
    ({ uuid, props }) => ({
      type: SurveyMapLayerType.preloadedMapLayer,
      id: uuid,
      label: props.labels?.[lang] || props.name || "",
    }),
  );
  return [...areaLayers, ...preloadedLayers].map((layer, index) => ({
    ...layer,
    key: `${layer.type}_${layer.id}`,
    color: layerColors[index % layerColors.length]!,
  }));
};
