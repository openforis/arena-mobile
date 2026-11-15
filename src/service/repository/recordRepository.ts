import {
  ArenaRecord,
  Dates,
  NodeDef,
  NodeDefType,
  Objects,
  Promises,
  Survey,
  Surveys,
  Validation,
} from "@openforis/arena-core";

import { DbUtils, dbClient, SQLiteClient, SqlParams, SqlValue } from "db";
import {
  RecordLoadStatus,
  RecordOrigin,
  RecordSummary,
  RemoteRecordSummary,
} from "model";
import { ArenaMobileRecord } from "model/ArenaMobileRecord";
import { log, SystemUtils } from "utils";
import {
  extractKeyColumnsValues,
  extractKeyOrSummaryColValue,
  extractRemoteRecordSummaryKeyColumnsValues,
  extractRemoteRecordSummarySummaryColumnsValues,
  extractSummaryAttributesValues,
  extractValidationCountsColumnsValues,
  fixDatetime,
  getRecordFixKey,
  insertColumns,
  insertColumnsJoint,
  keyColumnNames,
  isRowToBeFixed,
  keyColumnsSet,
  rowToRecord,
  summaryColumnsSet,
  summarySelectFieldsJoint,
  summarySelectFieldsJointWithValidation,
  toKeyOrSummaryColValue,
  validationCountsColumnsSet,
} from "./recordRowMapper";
import { RecordRow } from "./recordRow";

type SurveyParam = { survey: Survey };
type SurveyId = Survey["id"];
type RecordId = ArenaRecord["id"];
type SurveyAndRecordParams = SurveyParam & { record: ArenaMobileRecord };
type SurveyIdAndRecordUuidsParams = {
  surveyId: SurveyId;
  recordUuids: string[];
};
type ClientParam = { client?: SQLiteClient };
// value of a key attribute: code attribute values have an itemUuid
export type RecordKeyValue =
  | string
  | number
  | boolean
  | { itemUuid?: string; [key: string]: unknown }
  | null
  | undefined;

const fetchRecord = async ({
  survey,
  recordId,
  includeContent = true,
}: SurveyParam & {
  recordId: RecordId;
  includeContent?: boolean;
}): Promise<RecordSummary> => {
  const { id: surveyId } = survey;
  const row = await dbClient.one<RecordRow>(
    `SELECT ${summarySelectFieldsJointWithValidation}${includeContent ? ", content, fixed_for" : ""}
    FROM record
    WHERE survey_id = ? AND id = ?`,
    [surveyId, recordId],
  );
  const fixKey = getRecordFixKey(survey);
  const toBeFixed = isRowToBeFixed({ row: row!, fixKey });
  const record = rowToRecord({ survey })(row!);
  if (toBeFixed && fixKey) {
    await storeFixedRecordContent({ row: row!, record, fixKey });
  }
  return record;
};

// stored once: the next fetches skip the fixes until the survey or the app are updated
const storeFixedRecordContent = async ({
  row,
  record,
  fixKey,
}: {
  row: RecordRow;
  record: RecordSummary;
  fixKey: string;
}) => {
  try {
    // only if the content hasn't changed since it was read
    await dbClient.runSql(
      `UPDATE record SET content = ?, fixed_for = ?, ${validationCountsColumnsSet}
      WHERE id = ? AND content = ?`,
      [
        JSON.stringify(record),
        fixKey,
        ...extractValidationCountsColumnsValues(record),
        row.id,
        row.content,
      ],
    );
  } catch (error) {
    // the record is fixed in memory anyway: it will be fixed again next time
    log.warn(`error storing fixed record ${row.id}: ${error}`);
  }
};

const fetchRecordSummary = async ({
  survey,
  recordId,
}: SurveyParam & { recordId: RecordId }) =>
  fetchRecord({ survey, recordId, includeContent: false });

const fetchRecords = async ({
  survey,
  cycle = null,
  onlyLocal = true,
}: SurveyParam & {
  cycle?: string | null;
  onlyLocal?: boolean;
}): Promise<RecordSummary[]> => {
  const { id: surveyId } = survey;
  const whereConditions = ["merged_into_record_uuid IS NULL", "survey_id = ?"];
  const queryParams: SqlParams = [surveyId];

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
  const rows = await dbClient.many<RecordRow>(query, queryParams);
  return rows.map(rowToRecord({ survey }));
};

type KeyColParams = {
  keyDef: NodeDef<NodeDefType> | undefined;
  val: RecordKeyValue;
};

const getKeyColCondition = ({
  keyCol,
  keyDef,
  val,
}: KeyColParams & { keyCol: string }) => {
  if (val === null || val === undefined) {
    return `${keyCol} IS NULL`;
  }
  const conditions = [`${keyCol} = ?`];
  if (keyDef?.type === NodeDefType.code) {
    // key value could be a text (code) or a json object with itemUuid
    conditions.push(
      `(json_valid(${keyCol}) AND json(${keyCol}) ->> 'itemUuid' = ?)`,
    );
  }
  return `(${conditions.join(" OR ")})`;
};

const getKeyColParams = ({ keyDef, val }: KeyColParams): SqlParams => {
  const params: SqlParams = [];
  if (val === null || val === undefined) {
    return params;
  }
  const keyColumnParam = toKeyOrSummaryColValue(val);
  params.push(keyColumnParam);
  if (keyDef?.type === NodeDefType.code) {
    params.push(typeof val === "object" ? val.itemUuid : undefined);
  }
  return params;
};

const findRecordSummariesByKeys = async ({
  survey,
  cycle,
  keyValues,
}: SurveyParam & {
  cycle: string;
  keyValues: RecordKeyValue[];
}): Promise<RecordSummary[]> => {
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
  }, [] as SqlParams);

  // records merged into another one are hidden (see fetchRecords): the record they were merged
  // into has the same key(s), so they must not be counted as duplicates of it
  const query = `SELECT ${summarySelectFieldsJointWithValidation}
    FROM record
    WHERE merged_into_record_uuid IS NULL AND survey_id = ? AND cycle = ? AND ${keyColsConditions}`;

  const queryParams = [surveyId, cycle, ...keyColsParams];
  const rows = await dbClient.many<RecordRow>(query, queryParams);
  return rows.map(rowToRecord({ survey }));
};

const fetchRecordsWithEmptyCycle = async ({
  survey,
}: SurveyParam): Promise<RecordSummary[]> => {
  const { id: surveyId } = survey;

  const rows = await dbClient.many<RecordRow>(
    `SELECT ${summarySelectFieldsJoint}
    FROM record
    WHERE survey_id = ? AND cycle IS NULL
    ORDER BY date_modified DESC`,
    [surveyId],
  );
  return rows.map(rowToRecord({ survey }));
};

const insertRecord = async ({
  survey,
  record,
  loadStatus = RecordLoadStatus.complete,
}: SurveyAndRecordParams & {
  loadStatus?: RecordLoadStatus;
}): Promise<ArenaMobileRecord> => {
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
    VALUES (${DbUtils.placeholders(insertColumns)})`,
    [
      uuid,
      surveyId,
      JSON.stringify(record),
      dateCreated || Dates.nowFormattedForStorage(),
      dateModified || Dates.nowFormattedForStorage(),
      null,
      cycle,
      ownerUuid,
      ownerName,
      loadStatus,
      RecordOrigin.local,
      0,
      ...keyColumnsValues,
      ...summaryAttributesColumnValues,
      ...extractValidationCountsColumnsValues(record),
    ],
  );
  record.id = insertId;
  return record;
};

const insertRecordSummaries = async ({
  survey,
  cycle,
  recordSummaries,
}: SurveyParam & {
  cycle: string | null | undefined;
  recordSummaries: RemoteRecordSummary[];
}): Promise<number[]> => {
  const { id: surveyId } = survey;
  const loadStatus = RecordLoadStatus.summary;
  const origin = RecordOrigin.remote;
  const insertedIds: number[] = [];
  await dbClient.transaction(async (tx) => {
    await Promises.each(recordSummaries, async (recordSummary) => {
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
      const { insertId } = await tx.runSql(
        `INSERT INTO record (${insertColumnsJoint})
        VALUES (${DbUtils.placeholders(insertColumns)})`,
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
          recordSummary.readOnly ? 1 : 0,
          ...keyColumnsValues,
          ...summaryAttributesColumnValues,
          ...extractValidationCountsColumnsValues(null),
        ],
      );
      insertedIds.push(insertId);
    });
  });
  return insertedIds;
};

const updateRecordKeysAndDateModifiedWithSummaryFetchedRemotely = ({
  survey,
  recordSummary,
  client = dbClient,
}: SurveyParam & ClientParam & { recordSummary: RemoteRecordSummary }) => {
  const { dateModified, ownerUuid, ownerName, uuid } = recordSummary;
  const keyColumnsValues = extractRemoteRecordSummaryKeyColumnsValues({
    survey,
    recordSummary,
  });
  const summaryColumnValues = extractRemoteRecordSummarySummaryColumnsValues({
    survey,
    recordSummary,
  });
  return client.runSql(
    `UPDATE record SET 
      owner_uuid = ?,
      owner_name = ?,
      date_modified_remote = ?, 
      date_synced = ?,
      read_only = ?,
      ${keyColumnsSet},
      ${summaryColumnsSet}
    WHERE survey_id = ? AND uuid = ?`,
    [
      ownerUuid,
      ownerName,
      fixDatetime(dateModified),
      Dates.nowFormattedForStorage(),
      recordSummary.readOnly ? 1 : 0,
      ...keyColumnsValues,
      ...summaryColumnValues,
      survey.id,
      uuid,
    ],
  );
};

// one transaction: a commit per record is slow with many records
const updateRecordsKeysAndDateModifiedWithSummariesFetchedRemotely = ({
  survey,
  recordSummaries,
}: SurveyParam & { recordSummaries: RemoteRecordSummary[] }): Promise<void> =>
  dbClient.transaction(async (tx) => {
    await Promises.each(recordSummaries, async (recordSummary) => {
      try {
        await updateRecordKeysAndDateModifiedWithSummaryFetchedRemotely({
          survey,
          recordSummary,
          client: tx,
        });
      } catch (error) {
        throw new Error(
          `error updating local record keys for record ${recordSummary.uuid}. Details: ${error}`,
          { cause: error },
        );
      }
    });
  });

const updateRecordKeysAndContent = async ({
  survey,
  record,
  updateOrigin = false,
  origin = RecordOrigin.local,
  updateDateSynced = false,
  keepFixedFor = false,
  client = dbClient,
}: SurveyAndRecordParams &
  ClientParam & {
    updateOrigin?: boolean;
    origin?: RecordOrigin;
    updateDateSynced?: boolean;
    keepFixedFor?: boolean;
  }) => {
  const keyColumnsValues = extractKeyColumnsValues({ survey, record });
  const summaryAttributesValues = extractSummaryAttributesValues({
    survey,
    record,
  });
  const dateModifiedColumn =
    origin === RecordOrigin.remote ? "date_modified_remote" : "date_modified";

  await client.runSql(
    `UPDATE record SET 
      content = ?, 
      ${dateModifiedColumn} = ?, 
      load_status = ?, 
      ${updateOrigin ? "origin = ?," : ""}
      ${updateDateSynced ? "date_synced = ?," : ""}
      ${keepFixedFor ? "" : "fixed_for = NULL,"}
      ${keyColumnsSet},
      ${summaryColumnsSet},
      ${validationCountsColumnsSet}
    WHERE survey_id = ? AND uuid = ?`,
    [
      JSON.stringify(record),
      record.dateModified || Dates.nowFormattedForStorage(),
      RecordLoadStatus.complete,
      ...(updateOrigin ? [origin] : []),
      ...(updateDateSynced ? [Dates.nowFormattedForStorage()] : []),
      ...keyColumnsValues,
      ...summaryAttributesValues,
      ...extractValidationCountsColumnsValues(record),
      survey.id,
      record.uuid,
    ],
  );
};

const updateRecord = async ({ survey, record }: SurveyAndRecordParams) => {
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
    // edited in the editor: the record was fixed when fetched
    keepFixedFor: true,
  });
  return recordUpdated;
};

// Persists only the "validation" field of the record content: revalidation reconciles
// a stale cached validation with the record's actual current state, it's not a content
// edit, so origin, sync status and modified dates must not change.
const updateRecordValidation = async ({
  surveyId,
  recordUuid,
  validation,
}: {
  surveyId: SurveyId;
  recordUuid: string;
  validation: Validation;
}) =>
  dbClient.runSql(
    `UPDATE record SET content = json_set(content, '$.validation', json(?)), ${validationCountsColumnsSet}
     WHERE survey_id = ? AND uuid = ?`,
    [
      JSON.stringify(validation),
      ...extractValidationCountsColumnsValues({ validation }),
      surveyId,
      recordUuid,
    ],
  );

const updateRecordWithContentFetchedRemotely = async ({
  survey,
  record,
}: SurveyAndRecordParams) =>
  dbClient.transaction(async (tx) => {
    await updateRecordKeysAndContent({
      survey,
      record,
      updateOrigin: true,
      origin: RecordOrigin.remote,
      updateDateSynced: true,
      client: tx,
    });
    await updateRecordsDateModifiedSynced({
      surveyId: survey.id,
      dateModifiedByUuid: { [record.uuid]: record.dateModified },
      client: tx,
    });
  });

// used after a merge combined this device's edits with newer edits under the same record uuid
// on the server: the fetched content now mirrors the server, but it still carries this device's
// own contribution, so origin is kept as "local" (the record stays visible under "records in
// device") and the sync baseline is stamped so the next status check doesn't see it as modified
const updateRecordWithContentMergedFromRemote = async ({
  survey,
  record,
}: SurveyAndRecordParams) =>
  dbClient.transaction(async (tx) => {
    await updateRecordKeysAndContent({
      survey,
      record,
      updateOrigin: true,
      origin: RecordOrigin.local,
      updateDateSynced: true,
      client: tx,
    });
    await updateRecordsDateModifiedRemote({
      surveyId: survey.id,
      dateModifiedRemoteByUuid: { [record.uuid]: record.dateModified },
      client: tx,
    });
    await updateRecordsDateModifiedSynced({
      surveyId: survey.id,
      dateModifiedByUuid: { [record.uuid]: record.dateModified },
      client: tx,
    });
  });

const updateRecordsReadOnly = async ({
  surveyId,
  recordUuids,
  readOnly,
}: {
  surveyId: SurveyId;
  recordUuids: string[];
  readOnly: boolean;
}) => {
  if (recordUuids.length === 0) return;
  const sql = `UPDATE record
  SET read_only = ?
  WHERE survey_id = ?
    AND uuid IN (${DbUtils.placeholders(recordUuids)})`;
  return dbClient.runSql(sql, [readOnly ? 1 : 0, surveyId, ...recordUuids]);
};

const updateRecordsDateSync = async ({
  surveyId,
  recordUuids,
}: SurveyIdAndRecordUuidsParams) => {
  if (recordUuids.length === 0) return;
  const sql = `UPDATE record
  SET date_synced = ?
  WHERE survey_id = ?
    AND uuid IN (${DbUtils.placeholders(recordUuids)})`;
  return dbClient.runSql(sql, [
    Dates.nowFormattedForStorage(),
    surveyId,
    ...recordUuids,
  ]);
};

// one UPDATE per record, in a single transaction
const updateRecordsColumnByUuid = async ({
  surveyId,
  column,
  valueByUuid,
  client,
}: {
  surveyId: SurveyId;
  column: "date_modified_remote" | "date_modified_synced";
  valueByUuid: Record<string, SqlValue>;
  client: SQLiteClient;
}) => {
  await client.transaction(async (tx) => {
    await Promises.each(Object.entries(valueByUuid), async ([uuid, value]) => {
      await tx.runSql(
        `UPDATE record SET ${column} = ? WHERE survey_id = ? AND uuid = ?`,
        [value, surveyId, uuid],
      );
    });
  });
};

/**
 * Persists, for each given record uuid, the server's dateModified as last observed
 * by this device right after a successful upload. This is the baseline later used
 * to tell apart "safe to overwrite" (nothing changed on the server since) from a
 * true concurrent-edit conflict (server and device diverged from the same baseline).
 */
const updateRecordsDateModifiedRemote = async ({
  surveyId,
  dateModifiedRemoteByUuid,
  client = dbClient,
}: ClientParam & {
  surveyId: SurveyId;
  dateModifiedRemoteByUuid: Record<string, string | number | null | undefined>;
}) =>
  updateRecordsColumnByUuid({
    surveyId,
    column: "date_modified_remote",
    valueByUuid: Object.fromEntries(
      Object.entries(dateModifiedRemoteByUuid).map(([uuid, value]) => [
        uuid,
        fixDatetime(value),
      ]),
    ),
    client,
  });

const fetchRecordsDateModifiedByUuid = async ({
  surveyId,
  recordUuids,
}: SurveyIdAndRecordUuidsParams): Promise<
  Record<string, string | null | undefined>
> => {
  if (recordUuids.length === 0) return {};
  const rows = await dbClient.many<Pick<RecordRow, "uuid" | "date_modified">>(
    `SELECT uuid, date_modified FROM record
     WHERE survey_id = ? AND uuid IN (${DbUtils.placeholders(recordUuids)})`,
    [surveyId, ...recordUuids],
  );
  return Object.fromEntries(rows.map((row) => [row.uuid, row.date_modified]));
};

const updateRecordsDateModifiedSynced = async ({
  surveyId,
  dateModifiedByUuid,
  client = dbClient,
}: ClientParam & {
  surveyId: SurveyId;
  dateModifiedByUuid: Record<string, SqlValue>;
}) =>
  updateRecordsColumnByUuid({
    surveyId,
    column: "date_modified_synced",
    valueByUuid: dateModifiedByUuid,
    client,
  });

// uuids of the files referenced by the content stored in the device for the given records
// (all records if not specified)
const fetchRecordsFileUuids = async ({
  surveyId,
  recordUuids,
}: {
  surveyId: SurveyId;
  recordUuids?: string[];
}): Promise<string[]> => {
  if (recordUuids?.length === 0) return [];
  const recordsCondition = recordUuids
    ? `AND record.uuid IN (${DbUtils.placeholders(recordUuids)})`
    : "";
  const rows = await dbClient.many<{ file_uuid: string }>(
    `SELECT DISTINCT json_extract(node.value, '$.value.fileUuid') AS file_uuid
     FROM record, json_each(record.content, '$.nodes') AS node
     WHERE record.survey_id = ? 
       ${recordsCondition}
       AND json_valid(record.content)
       AND json_extract(node.value, '$.value.fileUuid') IS NOT NULL`,
    [surveyId, ...(recordUuids ?? [])],
  );
  return rows.map((row) => row.file_uuid);
};

// values of the nodes of the given defs stored in the device, without parsing the whole records
const fetchNodeValuesByDefUuids = async ({
  surveyId,
  cycle,
  nodeDefUuids,
}: {
  surveyId: SurveyId;
  cycle: string;
  nodeDefUuids: string[];
}): Promise<{ recordUuid: string; nodeDefUuid: string; value: unknown }[]> => {
  if (nodeDefUuids.length === 0) return [];
  const rows = await dbClient.many<{
    record_uuid: string;
    node_def_uuid: string;
    value: unknown;
  }>(
    `SELECT record.uuid AS record_uuid,
       json_extract(node.value, '$.nodeDefUuid') AS node_def_uuid,
       json_extract(node.value, '$.value') AS value
     FROM record, json_each(record.content, '$.nodes') AS node
     WHERE record.survey_id = ?
       AND record.cycle = ?
       AND record.merged_into_record_uuid IS NULL
       AND json_valid(record.content)
       AND json_extract(node.value, '$.nodeDefUuid') IN (${DbUtils.placeholders(nodeDefUuids)})
       AND json_extract(node.value, '$.value') IS NOT NULL`,
    [surveyId, cycle, ...nodeDefUuids],
  );
  return rows.map((row) => ({
    recordUuid: row.record_uuid,
    nodeDefUuid: row.node_def_uuid,
    value: extractKeyOrSummaryColValue({ row, col: "value" }),
  }));
};

const updateRecordsMergedInto = async ({
  surveyId,
  mergedRecordsMap,
}: {
  surveyId: SurveyId;
  mergedRecordsMap: Record<string, string>;
}) => {
  await dbClient.transaction(async (tx) => {
    await Promises.each(
      Object.entries(mergedRecordsMap),
      async ([uuid, mergedIntoRecordUuid]) => {
        await tx.runSql(
          `UPDATE record 
         SET merged_into_record_uuid = ? 
         WHERE survey_id =? 
           AND uuid = ?`,
          [mergedIntoRecordUuid, surveyId, uuid],
        );
      },
    );
  });
};

const fixRecordCycle = async ({
  survey,
  recordId,
}: SurveyParam & { recordId: RecordId }) => {
  const record = await fetchRecord({ survey, recordId });
  // cycle is null (not undefined) in the records to fix: a destructuring default wouldn't apply
  const cycle = record.cycle ?? Surveys.getDefaultCycleKey(survey);
  return dbClient.runSql(`UPDATE record SET cycle = ? WHERE id = ?`, [
    cycle,
    recordId,
  ]);
};

const deleteRecords = async ({
  surveyId,
  recordUuids,
}: SurveyIdAndRecordUuidsParams) => {
  if (recordUuids.length === 0) return;
  const sql = `DELETE FROM record 
    WHERE survey_id = ? AND uuid IN (${DbUtils.placeholders(recordUuids)})`;
  return dbClient.runSql(sql, [surveyId, ...recordUuids]);
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
  updateRecordValidation,
  updateRecordWithContentFetchedRemotely,
  updateRecordWithContentMergedFromRemote,
  updateRecordKeysAndDateModifiedWithSummaryFetchedRemotely,
  updateRecordsKeysAndDateModifiedWithSummariesFetchedRemotely,
  updateRecordsDateSync,
  updateRecordsDateModifiedRemote,
  updateRecordsDateModifiedSynced,
  fetchRecordsDateModifiedByUuid,
  updateRecordsReadOnly,
  updateRecordsMergedInto,
  fetchRecordsFileUuids,
  fetchNodeValuesByDefUuids,
  fixRecordCycle,
  deleteRecords,
};
