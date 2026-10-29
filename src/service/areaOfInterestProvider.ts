import {
  AreaOfInterest,
  AreaOfInterestProvider,
  Surveys,
} from "@openforis/arena-core";

import { Files } from "utils/Files";
import { SurveyFSRepository } from "./repository/surveyFSRepository";

// survey files are never modified (a new upload gets a new uuid): only the areas of the survey in use are cached
let cachedSurveyId: number | null = null;
const cache = new Map<string, AreaOfInterest>();

const isAreaOfInterest = (value: any): value is AreaOfInterest =>
  (value?.type === "Polygon" || value?.type === "MultiPolygon") &&
  Array.isArray(value.coordinates);

// the area files are stored by Arena already normalized as a Polygon or MultiPolygon geometry
const readAreaOfInterest = async ({
  surveyId,
  fileUuid,
}: {
  surveyId: number;
  fileUuid: string;
}): Promise<AreaOfInterest | undefined> => {
  try {
    const content = await Files.readJsonFromFile({
      fileUri: SurveyFSRepository.getSurveyPackageFileUri({
        surveyId,
        fileUuid,
      }),
    });
    return isAreaOfInterest(content) ? content : undefined;
  } catch {
    return undefined;
  }
};

const getAreaOfInterest: AreaOfInterestProvider["getAreaOfInterest"] = async ({
  survey,
  name,
}) => {
  const descriptor = Surveys.getAreaOfInterestByName({ survey, name });
  const surveyId = survey.id;
  // surveys fetched as JSON (no survey package) have no area files
  if (!descriptor || !surveyId) return undefined;
  if (surveyId !== cachedSurveyId) {
    cache.clear();
    cachedSurveyId = surveyId;
  }
  const { fileUuid } = descriptor;
  const cached = cache.get(fileUuid);
  if (cached) return cached;
  const areaOfInterest = await readAreaOfInterest({ surveyId, fileUuid });
  if (areaOfInterest) cache.set(fileUuid, areaOfInterest);
  return areaOfInterest;
};

export const AreaOfInterestProviderDefault: AreaOfInterestProvider = {
  getAreaOfInterest,
};
