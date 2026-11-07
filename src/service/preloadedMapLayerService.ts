import { Survey, SurveyFile } from "@openforis/arena-core";

import { Files } from "utils/Files";
import {
  MapLayerFileGeometries,
  MapLayerFileParser,
} from "utils/MapLayerFileParser";
import { log } from "utils/Logger";
import { SurveyFSRepository } from "./repository/surveyFSRepository";

const readKmz = async (fileUri: string): Promise<MapLayerFileGeometries> => {
  const unzippedDirUri = await Files.createTempFolder();
  try {
    await Files.unzip(fileUri, unzippedDirUri, "UTF-8");
    const kmlTexts: string[] = [];
    await Files.visitDirFilesRecursively({
      dirUri: unzippedDirUri,
      visitor: async (entryUri) => {
        if (Files.getExtension(entryUri) === "kml") {
          kmlTexts.push(await Files.readAsString(entryUri));
        }
      },
    });
    return MapLayerFileParser.mergeGeometries(
      kmlTexts.map(MapLayerFileParser.parseKml),
    );
  } finally {
    // temp folders are removed at startup anyway
    await Files.del(unzippedDirUri, true).catch(() => undefined);
  }
};

// undefined when the file is not on the device (survey fetched without package) or cannot be read
const readPreloadedMapLayer = async ({
  survey,
  file,
}: {
  survey: Survey;
  file: SurveyFile;
}): Promise<MapLayerFileGeometries | undefined> => {
  const surveyId = survey.id;
  if (!surveyId) return undefined;
  const fileUri = SurveyFSRepository.getSurveyPackageFileUri({
    surveyId,
    fileUuid: file.uuid,
  });
  try {
    if (!(await Files.exists(fileUri))) return undefined;
    // the stored file has no extension: the format comes from the original file name
    switch (Files.getExtension(file.props.name ?? "")) {
      case "geojson":
      case "json":
        return MapLayerFileParser.parseGeoJson(
          JSON.parse(await Files.readAsString(fileUri)),
        );
      case "kml":
        return MapLayerFileParser.parseKml(await Files.readAsString(fileUri));
      case "kmz":
        return Files.isUnzipSupported() ? await readKmz(fileUri) : undefined;
      default:
        return undefined;
    }
  } catch (error) {
    log.warn(`error reading preloaded map layer ${file.props.name}: ${error}`);
    return undefined;
  }
};

export const PreloadedMapLayerService = {
  readPreloadedMapLayer,
};
