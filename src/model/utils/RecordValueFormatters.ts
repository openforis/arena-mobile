import {
  ArenaRecordNode,
  FileNames,
  LanguageCode,
  NodeDef,
  NodeDefBoolean,
  NodeDefType,
  Numbers,
  Objects,
  Survey,
  Surveys,
} from "@openforis/arena-core";

import { FileSizes } from "utils/FileSizes";
import { GeoUtils } from "utils/GeoUtils";

import { PositionTracks } from "./PositionTracks";

// also satisfied by the i18next TFunction
export type SimpleTranslateFunction = (key: string) => string;

export type SummaryValueFormatterParams = {
  survey: Survey;
  cycle: string;
  nodeDef: NodeDef<NodeDefType>;
  node?: ArenaRecordNode;
  value: any;
  showLabel?: boolean;
  lang?: LanguageCode;
  t: SimpleTranslateFunction;
};

type CoordinateValue = {
  x?: number | string | null;
  y?: number | string | null;
  srs?: string;
};

type FileValue = {
  fileName?: string;
  fileNameCalculated?: string;
  fileSize?: number;
};

const yesNoValueByBooleanValue: Record<string, string> = {
  true: "yes",
  false: "no",
};

const formatBooleanValue = ({
  nodeDef,
  value,
  t,
}: Pick<SummaryValueFormatterParams, "nodeDef" | "value" | "t">): string => {
  if (Objects.isEmpty(value)) return "";
  const booleanValueString = String(String(value) === "true");
  const labelValue =
    (nodeDef as NodeDefBoolean).props.labelValue ?? "trueFalse";
  const labelKey =
    labelValue === "trueFalse"
      ? booleanValueString
      : yesNoValueByBooleanValue[booleanValueString];
  return t(`common:${labelKey}`);
};

const latLongSrsCode = "4326";
const coordinateDecimalDigitsLatLong = 5;
const coordinateDecimalDigitsProjected = 2;

const formatCoordinateNumber = (
  num: number | string | null | undefined,
  decimalDigits: number,
): string => {
  if (Objects.isEmpty(num)) return "";
  const rounded = Numbers.roundToPrecision(num, decimalDigits);
  return Number.isFinite(rounded) ? String(rounded) : String(num);
};

const formatCoordinateValue = ({
  survey,
  value,
}: {
  survey: Survey;
  value: CoordinateValue | null | undefined;
}): string => {
  const { x, y, srs: srsCode } = value ?? {};
  if (Objects.isEmpty(x) && Objects.isEmpty(y)) return "";
  const decimalDigits =
    srsCode === latLongSrsCode
      ? coordinateDecimalDigitsLatLong
      : coordinateDecimalDigitsProjected;
  const pointText = `${formatCoordinateNumber(x, decimalDigits)}, ${formatCoordinateNumber(y, decimalDigits)}`;
  // SRS is redundant when the survey defines only one
  if (Surveys.getSRSs(survey).length <= 1 || !srsCode) return pointText;
  return `${pointText} (${srsCode})`;
};

const uuidInTextRegex =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

const formatFileValue = ({
  value,
}: {
  value: FileValue | null | undefined;
}): string => {
  const { fileName, fileNameCalculated, fileSize } = value ?? {};
  if (Objects.isNotEmpty(fileNameCalculated)) return fileNameCalculated!;
  if (Objects.isEmpty(fileName)) return "";
  // generated names (e.g. camera captures) are not meaningful
  if (!uuidInTextRegex.test(fileName!)) return fileName!;
  const extension = FileNames.getExtension(fileName!).toUpperCase();
  const size = fileSize ? FileSizes.toHumanReadableFileSize(fileSize) : "";
  return [extension, size].filter((part) => Objects.isNotEmpty(part)).join(" ");
};

// track length or polygon area
const formatGeoValue = ({
  value,
}: {
  value: { geometry?: { type?: string } } | null | undefined;
}): string => {
  if (PositionTracks.isTrackValue(value)) {
    const segments = PositionTracks.fromFeature(value);
    return PositionTracks.formatLength(PositionTracks.computeLength(segments));
  }
  const polygonCoordinates =
    GeoUtils.extractPolygonCoordinatesFromGeoJson(value);
  if (polygonCoordinates) {
    return GeoUtils.formatArea(GeoUtils.computePolygonArea(polygonCoordinates));
  }
  return value?.geometry?.type ?? "";
};

const formatterByNodeDefType: Partial<
  Record<NodeDefType, (params: SummaryValueFormatterParams) => string>
> = {
  [NodeDefType.boolean]: formatBooleanValue,
  [NodeDefType.coordinate]: formatCoordinateValue,
  [NodeDefType.file]: formatFileValue,
  [NodeDefType.geo]: formatGeoValue,
};

export const RecordValueFormatters = {
  formatBooleanValue,
  formatCoordinateValue,
  formatFileValue,
  formatGeoValue,
  formatterByNodeDefType,
};
