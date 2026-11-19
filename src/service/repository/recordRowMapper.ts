import {
  ArenaRecord,
  Arrays,
  DateFormats,
  Dates,
  NodeDefs,
  NodeDefType,
  Objects,
  RecordFixer,
  Records,
  ArenaSurvey,
  Surveys,
  ArenaValidation,
  Validations,
  ArenaAnyNodeDef,
} from "@openforis/arena-core";

import {
  RecordSummaries,
  RecordSummary,
  RecordSummaryValues,
  RemoteRecordSummary,
  SurveyDefs,
} from "model";
import { ArenaMobileRecord } from "model/ArenaMobileRecord";
import { SystemUtils } from "utils";

import { RecordKeyOrSummaryColumn, RecordRow } from "./recordRow";

const SUPPORTED_KEYS = 5;
const SUPPORTED_SUMMARY_ATTRIBUTES = 5;

type SurveyAndRecordParams = { survey: ArenaSurvey; record: ArenaRecord };
type SurveyAndRemoteSummaryParams = {
  survey: ArenaSurvey;
  recordSummary: RemoteRecordSummary;
};
// a column value of a key or summary attribute
export type KeyOrSummaryColValue = string | null;

const toColumnsSet = (columns: string[]) =>
  columns.map((col) => `${col} = ?`).join(", ");

const generateColumnNamesWithPrefix = <P extends "key" | "summary">(
  prefix: P,
  count: number,
) =>
  Array.from(Arrays.fromNumberOfElements(count).keys()).map(
    (idx) => `${prefix}${idx + 1}` as const,
  );
export const keyColumnNames = generateColumnNamesWithPrefix(
  "key",
  SUPPORTED_KEYS,
);
const summaryAttributesColumnNames = generateColumnNamesWithPrefix(
  "summary",
  SUPPORTED_SUMMARY_ATTRIBUTES,
);

export const insertColumns = [
  "uuid",
  "survey_id",
  "content",
  "date_created",
  "date_modified",
  "date_modified_remote",
  "cycle",
  "owner_uuid",
  "owner_name",
  "load_status",
  "origin",
  "read_only",
  ...keyColumnNames,
  ...summaryAttributesColumnNames,
  "errors_count",
  "warnings_count",
];
export const insertColumnsJoint = insertColumns.join(", ");
const keyColumnNamesJoint = keyColumnNames.join(", ");
export const keyColumnsSet = toColumnsSet(keyColumnNames);
const summaryAttributesColumnNamesJoint =
  summaryAttributesColumnNames.join(", ");
export const summaryColumnsSet = toColumnsSet(summaryAttributesColumnNames);
export const summarySelectFieldsJoint = `id, uuid, date_created, date_modified, date_modified_remote, date_modified_synced, date_synced, cycle, owner_uuid, owner_name, load_status, origin, read_only, ${keyColumnNamesJoint}, ${summaryAttributesColumnNamesJoint}`;
export const summarySelectFieldsJointWithValidation = `${summarySelectFieldsJoint}, errors_count, warnings_count`;
export const validationCountsColumnsSet =
  "errors_count = ?, warnings_count = ?";

// values of the errors_count and warnings_count columns (null without validation)
export const extractValidationCountsColumnsValues = (
  record: { validation?: ArenaValidation | null } | null,
): [number | null, number | null] => {
  const validation = record?.validation;
  if (!validation) return [null, null];
  const counts =
    Validations.getCounts(validation) ??
    Validations.calculateCounts(validation);
  return [counts.errors ?? 0, counts.warnings ?? 0];
};

// summaries get only the validation counts, not the whole validation
export const validationFromCountsColumns = (
  row: Pick<RecordRow, "errors_count" | "warnings_count">,
): ArenaValidation | null => {
  const { errors_count: errors, warnings_count: warnings } = row;
  if (Objects.isNil(errors) && Objects.isNil(warnings)) return null;
  const counts = { errors: errors ?? 0, warnings: warnings ?? 0 };
  return { valid: counts.errors + counts.warnings === 0, counts };
};

export const toKeyOrSummaryColValue = (
  value: unknown,
): KeyOrSummaryColValue => {
  if (Objects.isEmpty(value)) return null;
  if (typeof value === "string") return value;
  return JSON.stringify(value);
};

export const extractKeyOrSummaryColValue = <C extends string>({
  row,
  col,
}: {
  row: { [key in C]?: unknown };
  col: C;
}): unknown => {
  const colValue = row[col];
  try {
    return JSON.parse(String(colValue));
  } catch (error) {
    return colValue;
  }
};

export const extractKeyColumnsValues = ({
  survey,
  record,
}: SurveyAndRecordParams): KeyOrSummaryColValue[] => {
  const keyValues = Records.getEntityKeyValues(
    survey,
    Records.getRoot(record)!,
    record.cycle,
  )(record);
  const keyColumnsValues = keyColumnNames.map((_keyCol, idx) => {
    const value = keyValues[idx];
    return toKeyOrSummaryColValue(value);
  });
  return keyColumnsValues;
};

export const extractSummaryAttributesValues = ({
  survey,
  record,
}: SurveyAndRecordParams): KeyOrSummaryColValue[] => {
  const rootDef = Surveys.getNodeDefRoot({ survey });
  const cycle = Records.getCycle(record);
  const summaryAttributeDefs =
    Surveys.getNodeDefsIncludedInMultipleEntitySummary({
      survey,
      cycle,
      nodeDef: rootDef,
    });
  const summaryAttributesColumnValues = summaryAttributesColumnNames.map(
    (_summaryCol, idx) => {
      const nodeDef = summaryAttributeDefs[idx];
      if (!nodeDef) return null;
      const root = Records.getRoot(record);
      const summaryNode = Records.getDescendant(root!, nodeDef)(record);
      return toKeyOrSummaryColValue(summaryNode?.value);
    },
  );
  return summaryAttributesColumnValues;
};

export const extractRemoteRecordSummaryKeyColumnsValues = ({
  survey,
  recordSummary,
}: SurveyAndRemoteSummaryParams): KeyOrSummaryColValue[] => {
  const { cycle } = recordSummary;
  const keyDefs = SurveyDefs.getRootKeyDefs({ survey, cycle });
  const keyColumnsValues = keyColumnNames.map((_keyColName, index) => {
    const keyDef = keyDefs[index];
    if (!keyDef) return null;
    const value = RecordSummaries.getKeyValue({ recordSummary, keyDef });
    return toKeyOrSummaryColValue(value);
  });
  return keyColumnsValues;
};

export const extractRemoteRecordSummarySummaryColumnsValues = ({
  survey,
  recordSummary,
}: SurveyAndRemoteSummaryParams): KeyOrSummaryColValue[] => {
  const { cycle } = recordSummary;
  const rootDef = Surveys.getNodeDefRoot({ survey });
  const summaryAttributeDefs =
    Surveys.getNodeDefsIncludedInMultipleEntitySummary({
      survey,
      cycle,
      nodeDef: rootDef,
    });
  const summaryColumnsValues = summaryAttributesColumnNames.map(
    (_summaryColName, index) => {
      const summaryDef = summaryAttributeDefs[index];
      if (!summaryDef) return null;
      const value =
        recordSummary.summaryAttributesObj?.[NodeDefs.getName(summaryDef)];
      return toKeyOrSummaryColValue(value);
    },
  );
  return summaryColumnsValues;
};

type DatetimeValue = string | number | null | undefined;

export function fixDatetime(
  dateStringOrNumber: string | number | undefined,
): string | undefined;
export function fixDatetime(
  dateStringOrNumber: DatetimeValue,
): string | null | undefined;
export function fixDatetime(dateStringOrNumber: DatetimeValue): DatetimeValue {
  if (!dateStringOrNumber) return dateStringOrNumber;

  if (typeof dateStringOrNumber === "number") {
    return Dates.formatForStorage(new Date(dateStringOrNumber));
  }
  const formatFrom = [
    DateFormats.datetimeStorage,
    DateFormats.datetimeDefault,
  ].find((frmt) => Dates.isValidDateInFormat(dateStringOrNumber, frmt));

  if (!formatFrom || formatFrom === DateFormats.datetimeStorage)
    return dateStringOrNumber;

  const parsed = Dates.parse(dateStringOrNumber, formatFrom);
  return parsed ? Dates.formatForStorage(parsed) : undefined;
}

// as read from the db: summaries have a null validation, records never synced a null dateModifiedSynced
type RecordFromRow = Omit<
  RecordSummary,
  "validation" | "dateModifiedSynced"
> & {
  validation?: ArenaValidation | null;
  dateModifiedSynced?: string | null;
};

type FixRowParams = {
  survey: ArenaSurvey;
  cycle: string | null | undefined;
  result: RecordFromRow;
  row: RecordRow;
};

const fixRowKeyOrSummaryAttributeColumns = ({
  result,
  row,
  columnNames,
  defs,
  wrapperProp,
}: {
  result: RecordFromRow;
  row: RecordRow;
  columnNames: RecordKeyOrSummaryColumn[];
  defs: ArenaAnyNodeDef[];
  wrapperProp: "keysObj" | "summaryAttributesObj";
}) => {
  const values: RecordSummaryValues = {};
  result[wrapperProp] = values;
  columnNames.forEach((col, index) => {
    const def = defs[index];
    if (def) {
      // a text value is never JSON: "1.50" must not become 1.5, nor "null" an empty value
      const value =
        def.type === NodeDefType.text
          ? row[col]
          : extractKeyOrSummaryColValue({ row, col });
      values[NodeDefs.getName(def)] = value;
    }
    Reflect.deleteProperty(result, col);
  });
};

const fixRowKeyAttributesColumns = ({
  survey,
  cycle,
  result,
  row,
}: FixRowParams) =>
  fixRowKeyOrSummaryAttributeColumns({
    result,
    row,
    columnNames: keyColumnNames,
    defs: SurveyDefs.getRootKeyDefs({ survey, cycle }),
    wrapperProp: "keysObj",
  });

const fixRowSummaryAttributesColumns = ({
  survey,
  cycle,
  result,
  row,
}: FixRowParams) => {
  const rootDef = Surveys.getNodeDefRoot({ survey });
  const summaryDefs = Surveys.getNodeDefsIncludedInMultipleEntitySummary({
    survey,
    cycle: cycle!,
    nodeDef: rootDef,
  });
  fixRowKeyOrSummaryAttributeColumns({
    result,
    row,
    columnNames: summaryAttributesColumnNames,
    defs: summaryDefs,
    wrapperProp: "summaryAttributesObj",
  });
};

const fixRowValidation = ({
  result,
  row,
  hasContent,
}: {
  result: RecordFromRow;
  row: RecordRow;
  hasContent: boolean;
}) => {
  if (!hasContent) {
    Reflect.deleteProperty(result, "errorsCount");
    Reflect.deleteProperty(result, "warningsCount");
    result.validation = validationFromCountsColumns(row);
    return;
  }
  if (result.validation) {
    let validation: ArenaValidation = result.validation;
    if (typeof validation === "string") {
      validation = JSON.parse(validation);
    }
    if (!validation.counts) {
      validation = Validations.updateCounts(validation);
    }
    result.validation = validation;
  }
};

// the fixes depend on the survey structure and on the app code (including arena-core RecordFixer):
// a record content is fixed again only when one of them changes (null: survey version unknown, always fix)
export const getRecordFixKey = (
  survey:
    Pick<ArenaSurvey, "datePublished" | "dateModified"> | null | undefined,
): string | null => {
  const surveyVersion = survey?.datePublished ?? survey?.dateModified;
  if (!surveyVersion) return null;
  const { version: appVersion } = SystemUtils.getRecordAppInfo();
  return `${surveyVersion}|${appVersion}`;
};

const rowHasContent = (row: Pick<RecordRow, "content">): boolean =>
  !Objects.isEmpty(row.content) && row.content !== "{}";

// fixed_for is selected only together with the content
export const isRowToBeFixed = ({
  row,
  fixKey,
}: {
  row: Pick<RecordRow, "content" | "fixed_for">;
  fixKey: string | null;
}): boolean => rowHasContent(row) && (!fixKey || row.fixed_for !== fixKey);

export const rowToRecord =
  ({ survey }: { survey: ArenaSurvey }) =>
  (row: RecordRow): RecordSummary => {
    const sideEffect = true;
    const hasToBeFixed = isRowToBeFixed({
      row,
      fixKey: getRecordFixKey(survey),
    });
    const { cycle } = row;
    const hasContent = rowHasContent(row);
    // same object as result, typed as a complete record
    let contentRecord: ArenaMobileRecord | undefined;
    let result: RecordFromRow;
    if (hasContent) {
      const parsed: ArenaMobileRecord = JSON.parse(row.content!);
      contentRecord = parsed;
      result = parsed;
    } else {
      result = Objects.camelize(row, { skip: ["content"] });
    }

    result.id = row.id;
    result.readOnly = !!row.read_only;

    // fix record dates format
    result.dateModified = fixDatetime(result.dateModified);
    result.dateCreated = fixDatetime(result.dateCreated);
    result.dateModifiedRemote = fixDatetime(result.dateModifiedRemote);
    result.dateModifiedSynced = fixDatetime(row.date_modified_synced);
    result.dateSynced = fixDatetime(result.dateSynced);

    if (contentRecord) {
      if (!contentRecord._nodesIndex) {
        // re-create nodes index
        Records.addNodes(Records.getNodes(contentRecord), { sideEffect })(
          contentRecord,
        );
      }
      if (hasToBeFixed) {
        for (const node of Records.getNodesArray(contentRecord)) {
          node.dateCreated = fixDatetime(node.dateCreated);
          node.dateModified = fixDatetime(node.dateModified);
        }
        RecordFixer.fixRecord({ survey, record: contentRecord, sideEffect });
      }
    }
    fixRowKeyAttributesColumns({ survey, cycle, result, row });
    fixRowSummaryAttributesColumns({ survey, cycle, result, row });

    if (!result.info?.createdWith) {
      result.info = { createdWith: SystemUtils.getRecordAppInfo() };
    }
    fixRowValidation({ result, row, hasContent });

    // typed as ArenaMobileRecord by the app (validation and dateModifiedSynced can be null)
    return result as RecordSummary;
  };
