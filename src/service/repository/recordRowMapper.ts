import {
  Arrays,
  DateFormats,
  Dates,
  NodeDefs,
  NodeDefType,
  Objects,
  RecordFixer,
  Records,
  Surveys,
  Validations,
} from "@openforis/arena-core";

import { RecordSummaries, SurveyDefs } from "model";
import { ArenaMobileRecord } from "model/ArenaMobileRecord";
import { SystemUtils } from "utils";

const SUPPORTED_KEYS = 5;
const SUPPORTED_SUMMARY_ATTRIBUTES = 5;

const toColumnsSet = (columns: any) =>
  columns.map((col: any) => `${col} = ?`).join(", ");

const generateColumnNamesWithPrefix = (prefix: any, count: any) =>
  Array.from(Arrays.fromNumberOfElements(count).keys()).map(
    (idx) => `${prefix}${idx + 1}`,
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
  record: any,
): [number | null, number | null] => {
  const validation = record?.validation;
  if (!validation) return [null, null];
  const counts =
    Validations.getCounts(validation) ??
    Validations.calculateCounts(validation);
  return [counts.errors ?? 0, counts.warnings ?? 0];
};

// summaries get only the validation counts, not the whole validation
export const validationFromCountsColumns = (row: any) => {
  const { errors_count: errors, warnings_count: warnings } = row;
  if (Objects.isNil(errors) && Objects.isNil(warnings)) return null;
  const counts = { errors: errors ?? 0, warnings: warnings ?? 0 };
  return { valid: counts.errors + counts.warnings === 0, counts };
};

export const toKeyOrSummaryColValue = (value: any) => {
  if (Objects.isEmpty(value)) return null;
  if (typeof value === "string") return value;
  return JSON.stringify(value);
};

export const extractKeyOrSummaryColValue = ({ row, col }: any) => {
  const colValue = row[col];
  try {
    return JSON.parse(colValue);
  } catch (error) {
    return colValue;
  }
};

export const extractKeyColumnsValues = ({ survey, record }: any) => {
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

export const extractSummaryAttributesValues = ({ survey, record }: any) => {
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
}: any) => {
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
}: any) => {
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

export const fixDatetime = (dateStringOrNumber: any): string | undefined => {
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
};

const fixRowKeyOrSummaryAttributeColumns = ({
  result,
  row,
  columnNames,
  defs,
  wrapperProp,
}: any) => {
  result[wrapperProp] = {};
  for (let index = 0; index < columnNames.length; index++) {
    const col = columnNames[index];
    const def = defs[index];
    if (def) {
      // a text value is never JSON: "1.50" must not become 1.5, nor "null" an empty value
      const value =
        def.type === NodeDefType.text
          ? row[col]
          : extractKeyOrSummaryColValue({ row, col });
      result[wrapperProp][NodeDefs.getName(def)] = value;
    }
    delete result[col];
  }
};

const fixRowKeyAttributesColumns = ({ survey, cycle, result, row }: any) =>
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
}: any) => {
  const rootDef = Surveys.getNodeDefRoot({ survey });
  const summaryDefs = Surveys.getNodeDefsIncludedInMultipleEntitySummary({
    survey,
    cycle,
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

const fixRowValidation = ({ result, row, hasContent }: any) => {
  if (!hasContent) {
    delete result.errorsCount;
    delete result.warningsCount;
    result.validation = validationFromCountsColumns(row);
    return;
  }
  let validation = result.validation;
  if (validation) {
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
export const getRecordFixKey = (survey: any): string | null => {
  const surveyVersion = survey?.datePublished ?? survey?.dateModified;
  if (!surveyVersion) return null;
  const { version: appVersion } = SystemUtils.getRecordAppInfo();
  return `${surveyVersion}|${appVersion}`;
};

const rowHasContent = (row: any): boolean =>
  !Objects.isEmpty(row.content) && row.content !== "{}";

// fixed_for is selected only together with the content
export const isRowToBeFixed = ({
  row,
  fixKey,
}: {
  row: any;
  fixKey: string | null;
}): boolean => rowHasContent(row) && (!fixKey || row.fixed_for !== fixKey);

export const rowToRecord =
  ({ survey }: any) =>
  (row: any): ArenaMobileRecord => {
    const sideEffect = true;
    const hasToBeFixed = isRowToBeFixed({
      row,
      fixKey: getRecordFixKey(survey),
    });
    const { cycle } = row;
    const hasContent = rowHasContent(row);
    const result: ArenaMobileRecord = hasContent
      ? JSON.parse(row.content)
      : Objects.camelize(row, { skip: ["content"] });

    result.id = row.id;
    result.readOnly = !!row.read_only;

    // fix record dates format
    result.dateModified = fixDatetime(result.dateModified);
    result.dateCreated = fixDatetime(result.dateCreated);
    result.dateModifiedRemote = fixDatetime(result.dateModifiedRemote);
    result.dateModifiedSynced = fixDatetime(row.date_modified_synced);
    result.dateSynced = fixDatetime(result.dateSynced);

    if (hasContent) {
      if (!result._nodesIndex) {
        // re-create nodes index
        Records.addNodes(Records.getNodes(result), { sideEffect })(result);
      }
      if (hasToBeFixed) {
        for (const node of Records.getNodesArray(result)) {
          node.dateCreated = fixDatetime(node.dateCreated);
          node.dateModified = fixDatetime(node.dateModified);
        }
        RecordFixer.fixRecord({ survey, record: result, sideEffect });
      }
    }
    fixRowKeyAttributesColumns({ survey, cycle, result, row });
    fixRowSummaryAttributesColumns({ survey, cycle, result, row });

    if (!result.info?.createdWith) {
      result.info = { createdWith: SystemUtils.getRecordAppInfo() };
    }
    fixRowValidation({ result, row, hasContent });

    return result;
  };
