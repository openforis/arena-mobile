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

import { DbUtils, dbClient } from "db";
import {
  RecordLoadStatus,
  RecordOrigin,
  RecordSummaries,
  SurveyDefs,
} from "model";
import { SystemUtils } from "utils";

const SUPPORTED_KEYS = 5;
const SUPPORTED_SUMMARY_ATTRIBUTES = 5;

const toColumnsSet = (columns) => columns.map((col) => `${col} = ?`).join(", ");

const generateColumnNamesWithPrefix = (prefix, count) =>
  Array.from(Arrays.fromNumberOfElements(count).keys()).map(
    (idx) => `${prefix}${idx + 1}`
  );
const keyColumnNames = generateColumnNamesWithPrefix("key", SUPPORTED_KEYS);
const summaryAttributesColumnNames = generateColumnNamesWithPrefix(
  "summary",
  SUPPORTED_SUMMARY_ATTRIBUTES
);

const insertColumns = [
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
  ...keyColumnNames,
  ...summaryAttributesColumnNames,
];
const insertColumnsJoint = insertColumns.join(", ");
const keyColumnNamesJoint = keyColumnNames.join(", ");
const keyColumnsSet = toColumnsSet(keyColumnNames);
const summaryAttributesColumnNamesJoint =
  summaryAttributesColumnNames.join(", ");
const summaryColumnsSet = toColumnsSet(summaryAttributesColumnNames);
const summarySelectFieldsJoint = `id, uuid, date_created, date_modified, date_modified_remote, date_synced, cycle, owner_uuid, owner_name, load_status, origin, ${keyColumnNamesJoint}, ${summaryAttributesColumnNamesJoint}`;
const summarySelectFieldsJointWithValidation = `${summarySelectFieldsJoint}, json(content) ->> 'validation' AS validation`;

const toKeyOrSummaryColValue = (value) => {
  if (Objects.isEmpty(value)) return null;
  if (typeof value === "string") return value;
  return JSON.stringify(value);
};

const extractKeyOrSummaryColValue = ({ row, col }) => {
  const colValue = row[col];
  try {
    return JSON.parse(colValue);
  } catch (error) {
    return colValue;
  }
};

const extractKeyColumnsValues = ({ survey, record }) => {
  const keyValues = Records.getEntityKeyValues({
    survey,
    cycle: record.cycle,
    record,
    entity: Records.getRoot(record),
  });
  const keyColumnsValues = keyColumnNames.map((_keyCol, idx) => {
    const value = keyValues[idx];
    return toKeyOrSummaryColValue(value);
  });
  return keyColumnsValues;
};

const extractSummaryAttributesValues = ({ survey, record }) => {
  const rootDef = Surveys.getNodeDefRoot({ survey });
  const summaryAttributeDefs =
    Surveys.getNodeDefsIncludedInMultipleEntitySummary({
      survey,
      nodeDef: rootDef,
    });
  const summaryAttributesColumnValues = summaryAttributesColumnNames.map(
    (_keyCol, idx) => {
      const nodeDef = summaryAttributeDefs[idx];
      if (!nodeDef) return null;
      const root = Records.getRoot(record);
      const summaryNode = Records.getDescendant({
        record,
        node: root,
        nodeDefDescendant: nodeDef,
      });
      return toKeyOrSummaryColValue(summaryNode?.value);
    }
  );
  return summaryAttributesColumnValues;
};

const extractRemoteRecordSummaryKeyColumnsValues = ({
  survey,
  recordSummary,
}) => {
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

const extractRemoteRecordSummarySummaryColumnsValues = ({
  survey,
  recordSummary,
}) => {
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
    }
  );
  return summaryColumnsValues;
};

const getPlaceholders = (count) =>
  Array.from(Array(count).keys())
    .map(() => "?")
    .join(", ");

const fetchRecord = async ({ survey, recordId, includeContent = true }) => {
  const { id: surveyId } = survey;
  const row = await dbClient.one(
    `SELECT ${summarySelectFieldsJointWithValidation}${includeContent ? ", content" : ""}
    FROM record
    WHERE survey_id = ? AND id = ?`,
    [surveyId, recordId]
  );
  return rowToRecord({ survey })(row);
};

const fetchRecordSummary = async ({ survey, recordId }) =>
  fetchRecord({ survey, recordId, includeContent: false });

const fetchRecords = async ({ survey, cycle = null, onlyLocal = true }) => {
  const { id: surveyId } = survey;
  const whereConditions = ["merged_into_record_uuid IS NULL", "survey_id = ?"];
  const queryParams = [surveyId];

  if (!Objects.isEmpty(cycle)) {
    whereConditions.push("cycle = ?");
    queryParams.push(cycle);
  }
  if (onlyLocal) {
    whereConditions.push("origin = ?");
    queryParams.push(RecordOrigin.local);
  }
  const query = `SELECT ${summarySelectFieldsJointWithValidation}
    FROM record
    WHERE ${whereConditions.join(" AND ")}
    ORDER BY date_modified DESC`;
  const rows = await dbClient.many(query, queryParams);
  return rows.map(rowToRecord({ survey }));
};

const getKeyColCondition = ({ keyCol, keyDef, val }) => {
  if (Objects.isNil(val)) {
    return `${keyCol} IS NULL`;
  }
  const conditions = [`${keyCol} = ?`];
  if (keyDef.type === NodeDefType.code) {
    // key value could be a text (code) or a json object with itemUuid
    conditions.push(
      `(json_valid(${keyCol}) AND json(${keyCol}) ->> 'itemUuid' = ?)`
    );
  }
  return `(${conditions.join(" OR ")})`;
};

const getKeyColParams = ({ keyDef, val }) => {
  const params = [];
  if (Objects.isNil(val)) {
    return params;
  }
  const keyColumnParam = toKeyOrSummaryColValue(val);
  params.push(keyColumnParam);
  if (keyDef.type === NodeDefType.code) {
    params.push(val.itemUuid);
  }
  return params;
};

const findRecordSummariesByKeys = async ({ survey, cycle, keyValues }) => {
  const { id: surveyId } = survey;
  const keyDefs = Surveys.getRootKeys({ survey, cycle });
  const keyColsConditions = keyColumnNames
    .map((keyCol, index) => {
      const keyDef = keyDefs[index];
      const val = keyValues[index];
      return getKeyColCondition({ keyCol, keyDef, val });
    })
    .join(" AND ");
  const keyColsParams = keyColumnNames.reduce((acc, _keyCol, index) => {
    const keyDef = keyDefs[index];
    const val = keyValues[index];
    acc.push(...getKeyColParams({ keyDef, val }));
    return acc;
  }, []);

  const query = `SELECT ${summarySelectFieldsJointWithValidation}
    FROM record
    WHERE survey_id = ? AND cycle = ? AND ${keyColsConditions}`;

  const queryParams = [surveyId, cycle, ...keyColsParams];
  const rows = await dbClient.many(query, queryParams);
  return rows.map(rowToRecord({ survey }));
};

const fetchRecordsWithEmptyCycle = async ({ survey }) => {
  const { id: surveyId } = survey;

  const rows = await dbClient.many(
    `SELECT ${summarySelectFieldsJoint}
    FROM record
    WHERE survey_id = ? AND cycle IS NULL"}
    ORDER BY date_modified DESC`,
    [surveyId]
  );
  return rows.map(rowToRecord({ survey }));
};

const insertRecord = async ({
  survey,
  record,
  loadStatus = RecordLoadStatus.complete,
}) => {
  const { id: surveyId } = survey;
  const keyColumnsValues = extractKeyColumnsValues({ survey, record });
  const summaryAttributesColumnValues = extractSummaryAttributesValues({
    survey,
    record,
  });
  const { uuid, dateCreated, dateModified, cycle, ownerUuid, ownerName } =
    record;

  const { insertId } = await dbClient.runSql(
    `INSERT INTO record (${insertColumnsJoint})
    VALUES (${getPlaceholders(insertColumns.length)})`,
    [
      uuid,
      surveyId,
      JSON.stringify(record),
      dateCreated || Date.now(),
      dateModified || Date.now(),
      null,
      cycle,
      ownerUuid,
      ownerName,
      loadStatus,
      RecordOrigin.local,
      ...keyColumnsValues,
      ...summaryAttributesColumnValues,
    ]
  );
  record.id = insertId;
  return record;
};

const insertRecordSummaries = async ({ survey, cycle, recordSummaries }) => {
  const { id: surveyId } = survey;
  const loadStatus = RecordLoadStatus.summary;
  const origin = RecordOrigin.remote;
  const insertedIds = [];
  await dbClient.transaction(async () => {
    for await (const recordSummary of recordSummaries) {
      const { dateCreated, dateModified, ownerUuid, ownerName, uuid } =
        recordSummary;
      const keyColumnsValues = extractRemoteRecordSummaryKeyColumnsValues({
        survey,
        recordSummary,
      });
      const summaryAttributesColumnValues =
        extractRemoteRecordSummarySummaryColumnsValues({
          survey,
          recordSummary,
        });
      const { insertId } = await dbClient.runSql(
        `INSERT INTO record (${insertColumnsJoint})
        VALUES (${getPlaceholders(insertColumns.length)})`,
        [
          uuid,
          surveyId,
          "{}", // empty content
          fixDatetime(dateCreated),
          fixDatetime(dateModified),
          fixDatetime(dateModified),
          cycle,
          ownerUuid,
          ownerName,
          loadStatus,
          origin,
          ...keyColumnsValues,
          ...summaryAttributesColumnValues,
        ]
      );
      insertedIds.push(insertId);
    }
  });
  return insertedIds;
};

const updateRecordKeysAndDateModifiedWithSummaryFetchedRemotely = async ({
  survey,
  recordSummary,
}) => {
  const { dateModified, ownerUuid, ownerName, uuid } = recordSummary;
  const keyColumnsValues = extractRemoteRecordSummaryKeyColumnsValues({
    survey,
    recordSummary,
  });
  const summaryColumnValues = extractRemoteRecordSummarySummaryColumnsValues({
    survey,
    recordSummary,
  });
  return dbClient.runSql(
    `UPDATE record SET 
      owner_uuid = ?,
      owner_name = ?,
      date_modified_remote = ?, 
      date_synced = ?,
      ${keyColumnsSet},
      ${summaryColumnsSet}
    WHERE survey_id = ? AND uuid = ?`,
    [
      ownerUuid,
      ownerName,
      fixDatetime(dateModified),
      Dates.nowFormattedForStorage(),
      ...keyColumnsValues,
      ...summaryColumnValues,
      survey.id,
      uuid,
    ]
  );
};

const updateRecordKeysAndContent = async ({
  survey,
  record,
  updateOrigin = false,
  origin = RecordOrigin.local,
}) => {
  const keyColumnsValues = extractKeyColumnsValues({ survey, record });
  const summaryAttributesValues = extractSummaryAttributesValues({
    survey,
    record,
  });
  const dateModifiedColumn =
    origin === RecordOrigin.remote ? "date_modified_remote" : "date_modified";

  return dbClient.runSql(
    `UPDATE record SET 
      content = ?, 
      ${dateModifiedColumn} = ?, 
      load_status = ?, 
      ${updateOrigin ? "origin = ?," : ""}
      date_synced = ?,
      ${keyColumnsSet},
      ${summaryColumnsSet}
    WHERE survey_id = ? AND uuid = ?`,
    [
      JSON.stringify(record),
      record.dateModified || Date.now(),
      RecordLoadStatus.complete,
      ...(updateOrigin ? [origin] : []),
      Dates.nowFormattedForStorage(),
      ...keyColumnsValues,
      ...summaryAttributesValues,
      survey.id,
      record.uuid,
    ]
  );
};

const updateRecord = async ({ survey, record }) => {
  const recordUpdated = Objects.assocPath({
    obj: record,
    path: ["info", "modifiedWith"],
    value: SystemUtils.getRecordAppInfo(),
  });
  await updateRecordKeysAndContent({
    survey,
    record: recordUpdated,
    updateOrigin: true,
    origin: RecordOrigin.local,
  });
  return recordUpdated;
};

const updateRecordWithContentFetchedRemotely = async ({ survey, record }) =>
  updateRecordKeysAndContent({ survey, record, origin: RecordOrigin.remote });

const updateRecordsDateSync = async ({ surveyId, recordUuids }) => {
  const sql = `UPDATE record 
  SET date_synced = ?
  WHERE survey_id = ? 
    AND uuid IN (${DbUtils.quoteValues(recordUuids)})`;
  return dbClient.runSql(sql, [Dates.nowFormattedForStorage(), surveyId]);
};

const updateRecordsMergedInto = async ({ surveyId, mergedRecordsMap }) => {
  await dbClient.transaction(async () => {
    for await (const [uuid, mergedIntoRecordUuid] of Object.entries(
      mergedRecordsMap
    ))
      await dbClient.runSql(
        `UPDATE record 
         SET merged_into_record_uuid = ? 
         WHERE survey_id =? 
           AND uuid = ?`,
        [mergedIntoRecordUuid, surveyId, uuid]
      );
  });
};

const fixRecordCycle = async ({ survey, recordId }) => {
  const record = await fetchRecord({ survey, recordId });
  const { cycle = Surveys.getDefaultCycleKey(survey) } = record;
  return dbClient.runSql(`UPDATE record SET cycle = ? WHERE id = ?`, [
    cycle,
    recordId,
  ]);
};

const deleteRecords = async ({ surveyId, recordUuids }) => {
  const sql = `DELETE FROM record 
    WHERE survey_id = ? AND uuid IN (${DbUtils.quoteValues(recordUuids)})`;
  return dbClient.runSql(sql, [surveyId]);
};

const fixDatetime = (dateStringOrNumber) => {
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
  return Dates.formatForStorage(parsed);
};

const fixRowKeyOrSummaryAttributeColumns = ({
  result,
  row,
  columnNames,
  defs,
  wrapperProp,
}) => {
  result[wrapperProp] = {};
  for (let index = 0; index < columnNames.length; index++) {
    const col = columnNames[index];
    const def = defs[index];
    if (def) {
      const value = extractKeyOrSummaryColValue({ row, col });
      result[wrapperProp][NodeDefs.getName(def)] = value;
    }
    delete result[col];
  }
};

const fixRowKeyAttributesColumns = ({ survey, cycle, result, row }) =>
  fixRowKeyOrSummaryAttributeColumns({
    result,
    row,
    columnNames: keyColumnNames,
    defs: SurveyDefs.getRootKeyDefs({ survey, cycle }),
    wrapperProp: "keysObj",
  });

const fixRowSummaryAttributesColumns = ({ survey, cycle, result, row }) => {
  const rootDef = Surveys.getNodeDefRoot({ survey });
  const summaryDefs = Surveys.getNodeDefsIncludedInMultipleEntitySummary({
    survey,
    cycle,
    nodeDef: rootDef,
  });
  fixRowKeyOrSummaryAttributeColumns({
    result,
    row,
    columnNames: keyColumnNames,
    defs: summaryDefs,
    wrapperProp: "summaryAttributesObj",
  });
};

const rowToRecord =
  ({ survey }) =>
  (row) => {
    const sideEffect = true;
    const hasToBeFixed = true;
    const { cycle, content } = row;
    const hasContent = !Objects.isEmpty(content) && content !== "{}";
    const result = hasContent
      ? JSON.parse(row.content)
      : Objects.camelize(row, { skip: ["content"] });

    result.id = row.id;

    // fix record dates format
    result.dateModified = fixDatetime(result.dateModified);
    result.dateCreated = fixDatetime(result.dateCreated);
    result.dateModifiedRemote = fixDatetime(result.dateModifiedRemote);
    result.dateSynced = fixDatetime(result.dateSynced);

    if (hasContent) {
      if (!result._nodesIndex) {
        // re-create nodes index
        Records.addNodes(Records.getNodes(result), { sideEffect })(result);
      }
      // fix node dates format
      if (hasToBeFixed) {
        for (const node of Records.getNodesArray(result)) {
          node.dateCreated = fixDatetime(node.dateCreated);
          node.dateModified = fixDatetime(node.dateModified);
        }
        RecordFixer.insertMissingSingleNodes({
          survey,
          record: result,
          sideEffect,
        });
      }
    }
    fixRowKeyAttributesColumns({ survey, cycle, result, row });
    fixRowSummaryAttributesColumns({ survey, cycle, result, row });

    if (!result.info?.createdWith) {
      result.info = {
        createdWith: SystemUtils.getRecordAppInfo(),
      };
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
    return result;
  };

export const RecordRepository = {
  fetchRecord,
  fetchRecordSummary,
  fetchRecords,
  findRecordSummariesByKeys,
  fetchRecordsWithEmptyCycle,
  insertRecord,
  insertRecordSummaries,
  updateRecord,
  updateRecordWithContentFetchedRemotely,
  updateRecordKeysAndDateModifiedWithSummaryFetchedRemotely,
  updateRecordsDateSync,
  updateRecordsMergedInto,
  fixRecordCycle,
  deleteRecords,
};
