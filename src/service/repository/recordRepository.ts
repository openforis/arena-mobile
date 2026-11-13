import {
  Dates,
  NodeDefType,
  Objects,
  Promises,
  Surveys,
} from "@openforis/arena-core";

import { DbUtils, dbClient } from "db";
import { RecordLoadStatus, RecordOrigin } from "model";
import { ArenaMobileRecord } from "model/ArenaMobileRecord";
import { log, SystemUtils } from "utils";
import {
  extractKeyColumnsValues,
  extractKeyOrSummaryColValue,
  extractRemoteRecordSummaryKeyColumnsValues,
  extractRemoteRecordSummarySummaryColumnsValues,
  extractSummaryAttributesValues,
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
} from "./recordRowMapper";

const getPlaceholders = (count: any) =>
  Array.from(new Array(count).keys())
    .map(() => "?")
    .join(", ");

const fetchRecord = async ({
  survey,
  recordId,
  includeContent = true,
}: any): Promise<ArenaMobileRecord> => {
  const { id: surveyId } = survey;
  const row = await dbClient.one(
    `SELECT ${summarySelectFieldsJointWithValidation}${includeContent ? ", content, fixed_for" : ""}
    FROM record
    WHERE survey_id = ? AND id = ?`,
    [surveyId, recordId],
  );
  const fixKey = getRecordFixKey(survey);
  const toBeFixed = isRowToBeFixed({ row, fixKey });
  const record = rowToRecord({ survey })(row);
  if (toBeFixed && fixKey) {
    await storeFixedRecordContent({ row, record, fixKey });
  }
  return record;
};

// stored once: the next fetches skip the fixes until the survey or the app are updated
const storeFixedRecordContent = async ({ row, record, fixKey }: any) => {
  try {
    // only if the content hasn't changed since it was read
    await dbClient.runSql(
      `UPDATE record SET content = ?, fixed_for = ? WHERE id = ? AND content = ?`,
      [JSON.stringify(record), fixKey, row.id, row.content],
    );
  } catch (error) {
    // the record is fixed in memory anyway: it will be fixed again next time
    log.warn(`error storing fixed record ${row.id}: ${error}`);
  }
};

const fetchRecordSummary = async ({ survey, recordId }: any) =>
  fetchRecord({ survey, recordId, includeContent: false });

const fetchRecords = async ({
  survey,
  cycle = null,
  onlyLocal = true,
}: any) => {
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

const getKeyColCondition = ({ keyCol, keyDef, val }: any) => {
  if (Objects.isNil(val)) {
    return `${keyCol} IS NULL`;
  }
  const conditions = [`${keyCol} = ?`];
  if (keyDef.type === NodeDefType.code) {
    // key value could be a text (code) or a json object with itemUuid
    conditions.push(
      `(json_valid(${keyCol}) AND json(${keyCol}) ->> 'itemUuid' = ?)`,
    );
  }
  return `(${conditions.join(" OR ")})`;
};

const getKeyColParams = ({ keyDef, val }: any) => {
  const params: any = [];
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

const findRecordSummariesByKeys = async ({ survey, cycle, keyValues }: any) => {
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
  }, [] as any[]);

  // records merged into another one are hidden (see fetchRecords): the record they were merged
  // into has the same key(s), so they must not be counted as duplicates of it
  const query = `SELECT ${summarySelectFieldsJointWithValidation}
    FROM record
    WHERE merged_into_record_uuid IS NULL AND survey_id = ? AND cycle = ? AND ${keyColsConditions}`;

  const queryParams = [surveyId, cycle, ...keyColsParams];
  const rows = await dbClient.many(query, queryParams);
  return rows.map(rowToRecord({ survey }));
};

const fetchRecordsWithEmptyCycle = async ({
  survey,
}: any): Promise<ArenaMobileRecord[]> => {
  const { id: surveyId } = survey;

  const rows = await dbClient.many(
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
}: any) => {
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
    ],
  );
  record.id = insertId;
  return record;
};

const insertRecordSummaries = async ({
  survey,
  cycle,
  recordSummaries,
}: any) => {
  const { id: surveyId } = survey;
  const loadStatus = RecordLoadStatus.summary;
  const origin = RecordOrigin.remote;
  const insertedIds: any = [];
  await dbClient.transaction(async (tx) => {
    await Promises.each(recordSummaries, async (recordSummary: any) => {
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
          recordSummary.readOnly ? 1 : 0,
          ...keyColumnsValues,
          ...summaryAttributesColumnValues,
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
}: any) => {
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
}: any): Promise<void> =>
  dbClient.transaction(async (tx) => {
    await Promises.each(recordSummaries, async (recordSummary: any) => {
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
}: any) => {
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
      ${summaryColumnsSet}
    WHERE survey_id = ? AND uuid = ?`,
    [
      JSON.stringify(record),
      record.dateModified || Dates.nowFormattedForStorage(),
      RecordLoadStatus.complete,
      ...(updateOrigin ? [origin] : []),
      ...(updateDateSynced ? [Dates.nowFormattedForStorage()] : []),
      ...keyColumnsValues,
      ...summaryAttributesValues,
      survey.id,
      record.uuid,
    ],
  );
};

const updateRecord = async ({ survey, record }: any) => {
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
}: any) =>
  dbClient.runSql(
    `UPDATE record SET content = json_set(content, '$.validation', json(?))
     WHERE survey_id = ? AND uuid = ?`,
    [JSON.stringify(validation), surveyId, recordUuid],
  );

const updateRecordWithContentFetchedRemotely = async ({
  survey,
  record,
}: any) =>
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
}: any) =>
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
  surveyId: number;
  recordUuids: string[];
  readOnly: boolean;
}) => {
  if (recordUuids.length === 0) return;
  const sql = `UPDATE record
  SET read_only = ?
  WHERE survey_id = ?
    AND uuid IN (${DbUtils.quoteValues(recordUuids)})`;
  return dbClient.runSql(sql, [readOnly ? 1 : 0, surveyId]);
};

const updateRecordsDateSync = async ({ surveyId, recordUuids }: any) => {
  const sql = `UPDATE record
  SET date_synced = ?
  WHERE survey_id = ?
    AND uuid IN (${DbUtils.quoteValues(recordUuids)})`;
  return dbClient.runSql(sql, [Dates.nowFormattedForStorage(), surveyId]);
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
}: any) => {
  await client.transaction(async (tx: any) => {
    await Promises.each(
      Object.entries(dateModifiedRemoteByUuid),
      async ([uuid, dateModifiedRemote]) => {
        await tx.runSql(
          `UPDATE record SET date_modified_remote = ? WHERE survey_id = ? AND uuid = ?`,
          [fixDatetime(dateModifiedRemote), surveyId, uuid],
        );
      },
    );
  });
};

const fetchRecordsDateModifiedByUuid = async ({
  surveyId,
  recordUuids,
}: any): Promise<Record<string, any>> => {
  const rows: any[] = await dbClient.many(
    `SELECT uuid, date_modified FROM record
     WHERE survey_id = ? AND uuid IN (${DbUtils.quoteValues(recordUuids)})`,
    [surveyId],
  );
  return Object.fromEntries(rows.map((row) => [row.uuid, row.date_modified]));
};

const updateRecordsDateModifiedSynced = async ({
  surveyId,
  dateModifiedByUuid,
  client = dbClient,
}: any) => {
  await client.transaction(async (tx: any) => {
    await Promises.each(
      Object.entries(dateModifiedByUuid),
      async ([uuid, dateModified]) => {
        await tx.runSql(
          `UPDATE record SET date_modified_synced = ? WHERE survey_id = ? AND uuid = ?`,
          [dateModified, surveyId, uuid],
        );
      },
    );
  });
};

// uuids of the files referenced by the content stored in the device for the given records
// (all records if not specified)
const fetchRecordsFileUuids = async ({
  surveyId,
  recordUuids,
}: any): Promise<string[]> => {
  const recordsCondition = recordUuids
    ? `AND record.uuid IN (${DbUtils.quoteValues(recordUuids)})`
    : "";
  const rows = await dbClient.many(
    `SELECT DISTINCT json_extract(node.value, '$.value.fileUuid') AS file_uuid
     FROM record, json_each(record.content, '$.nodes') AS node
     WHERE record.survey_id = ? 
       ${recordsCondition}
       AND json_valid(record.content)
       AND json_extract(node.value, '$.value.fileUuid') IS NOT NULL`,
    [surveyId],
  );
  return rows.map((row: any) => row.file_uuid);
};

// values of the nodes of the given defs stored in the device, without parsing the whole records
const fetchNodeValuesByDefUuids = async ({
  surveyId,
  cycle,
  nodeDefUuids,
}: {
  surveyId: number;
  cycle: string;
  nodeDefUuids: string[];
}): Promise<{ recordUuid: string; nodeDefUuid: string; value: any }[]> => {
  if (nodeDefUuids.length === 0) return [];
  const rows = await dbClient.many(
    `SELECT record.uuid AS record_uuid,
       json_extract(node.value, '$.nodeDefUuid') AS node_def_uuid,
       json_extract(node.value, '$.value') AS value
     FROM record, json_each(record.content, '$.nodes') AS node
     WHERE record.survey_id = ?
       AND record.cycle = ?
       AND record.merged_into_record_uuid IS NULL
       AND json_valid(record.content)
       AND json_extract(node.value, '$.nodeDefUuid') IN (${getPlaceholders(nodeDefUuids.length)})
       AND json_extract(node.value, '$.value') IS NOT NULL`,
    [surveyId, cycle, ...nodeDefUuids],
  );
  return rows.map((row: any) => ({
    recordUuid: row.record_uuid,
    nodeDefUuid: row.node_def_uuid,
    value: extractKeyOrSummaryColValue({ row, col: "value" }),
  }));
};

const updateRecordsMergedInto = async ({ surveyId, mergedRecordsMap }: any) => {
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

const fixRecordCycle = async ({ survey, recordId }: any) => {
  const record = await fetchRecord({ survey, recordId });
  const { cycle = Surveys.getDefaultCycleKey(survey) } = record;
  return dbClient.runSql(`UPDATE record SET cycle = ? WHERE id = ?`, [
    cycle,
    recordId,
  ]);
};

const deleteRecords = async ({ surveyId, recordUuids }: any) => {
  const sql = `DELETE FROM record 
    WHERE survey_id = ? AND uuid IN (${DbUtils.quoteValues(recordUuids)})`;
  return dbClient.runSql(sql, [surveyId]);
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
