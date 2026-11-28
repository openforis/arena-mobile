import {
  ArenaRecord,
  Promises,
  RecordCloner,
  Records,
  RecordValidator,
  ArenaSurvey,
  Surveys,
  ArenaUser,
  ArenaUserGroup,
  Validations,
} from "@openforis/arena-core";

import { RecordUtils, UserGroupQualifiers } from "model";
import type { ArenaMobileRecord } from "model";
import { ArrayUtils, Files, log, PromiseUtils, SystemUtils } from "utils";

import {
  RecordKeyValue,
  RecordRepository,
} from "../repository/recordRepository";
import { RecordFileService } from "./recordFileService";
import { AreaOfInterestProviderDefault } from "../survey/areaOfInterestProvider";

type RecordsDeleteParams = {
  surveyId: number | undefined;
  recordUuids: string[];
};

// a file can still be referenced by another record (e.g. after a merge)
const deleteFilesNotReferenced = async ({
  surveyId,
  fileUuids,
}: {
  surveyId: number | undefined;
  fileUuids: string[];
}) => {
  if (fileUuids.length === 0) return;
  const fileUuidsReferenced = new Set(
    await RecordRepository.fetchRecordsFileUuids({ surveyId }),
  );
  await Promises.each(
    fileUuids.filter((fileUuid: string) => !fileUuidsReferenced.has(fileUuid)),
    async (fileUuid: string) => {
      try {
        await RecordFileService.deleteRecordFile({
          surveyId: surveyId!,
          fileUuid,
        });
      } catch (error) {
        log.warn(`error deleting file ${fileUuid}: ${error}`);
      }
    },
  );
};

const deleteRecordsAndFiles = async ({
  surveyId,
  recordUuids,
}: RecordsDeleteParams) => {
  const fileUuids = await RecordRepository.fetchRecordsFileUuids({
    surveyId,
    recordUuids,
  });
  await RecordRepository.deleteRecords({ surveyId, recordUuids });
  await deleteFilesNotReferenced({ surveyId, fileUuids });
};

const FILES_EXISTENCE_CHECK_CONCURRENCY = 10;

// uuids of the files of the given records already stored in the device: when fetching those
// records from the server again, their content doesn't need to be downloaded another time (a
// file uuid always identifies the same content). Best effort: nothing is excluded on errors.
const findFileUuidsInDevice = async ({
  survey,
  recordUuids,
}: {
  survey: ArenaSurvey | undefined;
  recordUuids: string[];
}): Promise<string[]> => {
  try {
    const surveyId = survey!.id!;
    const fileUuids = await RecordRepository.fetchRecordsFileUuids({
      surveyId,
      recordUuids,
    });
    const fileUuidsInDevice: string[] = [];
    await PromiseUtils.runWithConcurrency({
      items: fileUuids,
      concurrency: FILES_EXISTENCE_CHECK_CONCURRENCY,
      task: async (fileUuid) => {
        if (
          !(await RecordFileService.recordFileMissing({ surveyId, fileUuid }))
        ) {
          fileUuidsInDevice.push(fileUuid);
        }
      },
    });
    return fileUuidsInDevice;
  } catch (error) {
    log.warn(`error finding the record files already in the device: ${error}`);
    return [];
  }
};

// size of the files of each record to send, without the excluded ones (e.g. already on the server)
const fetchRecordsFilesSize = async ({
  surveyId,
  recordUuids,
  excludedFileUuidsByRecordUuid = {},
}: {
  surveyId: number;
  recordUuids: string[];
  excludedFileUuidsByRecordUuid?: Record<string, string[]>;
}): Promise<Record<string, number>> => {
  const files = await RecordRepository.fetchRecordsFiles({
    surveyId,
    recordUuids,
  });
  const sizeByRecordUuid: Record<string, number> = {};
  await PromiseUtils.runWithConcurrency({
    items: files,
    concurrency: FILES_EXISTENCE_CHECK_CONCURRENCY,
    task: async ({ recordUuid, fileUuid, fileSize }) => {
      if (excludedFileUuidsByRecordUuid[recordUuid]?.includes(fileUuid)) return;
      const size =
        fileSize ??
        (await Files.getSize(
          RecordFileService.getRecordFileUri({ surveyId, fileUuid }),
        ));
      sizeByRecordUuid[recordUuid] = (sizeByRecordUuid[recordUuid] ?? 0) + size;
    },
  });
  return sizeByRecordUuid;
};

const findRecordSummariesByKeys = async ({
  survey,
  cycle,
  keyValues,
  keyValuesFormatted,
}: {
  survey: ArenaSurvey;
  cycle: string;
  keyValues: RecordKeyValue[];
  keyValuesFormatted: string[];
}): Promise<ArenaMobileRecord[]> => {
  const recordSummariesForKeyValues: ArenaMobileRecord[] =
    await RecordRepository.findRecordSummariesByKeys({
      survey,
      cycle,
      keyValues,
    });
  const recordSummariesForKeyValuesByUuid = ArrayUtils.indexByUuid(
    recordSummariesForKeyValues,
  );
  // try to fetch records using formatted keys
  const recordSummariesForKeyValuesFormatted: ArenaMobileRecord[] =
    await RecordRepository.findRecordSummariesByKeys({
      survey,
      cycle,
      keyValues: keyValuesFormatted,
    });
  const recordSummaries = [...recordSummariesForKeyValues];
  for (const recordSummary of recordSummariesForKeyValuesFormatted) {
    if (!recordSummariesForKeyValuesByUuid[recordSummary.uuid]) {
      recordSummaries.push(recordSummary);
    }
  }
  return recordSummaries;
};

const findRecordSummariesWithSameKeys = async ({
  survey,
  record,
  lang,
  cycle: cycleParam = null,
}: {
  survey: ArenaSurvey;
  record: ArenaRecord;
  lang?: string;
  cycle?: string | null;
}) => {
  const cycle = cycleParam ?? Records.getCycle(record);
  const rootEntity = Records.getRoot(record)!;
  const keyValues = Records.getEntityKeyValues(
    survey,
    rootEntity,
    cycle,
  )(record);
  const keyValuesFormatted = RecordUtils.getRootEntityKeysFormatted({
    survey,
    record,
    lang,
    showLabel: false,
  });
  return findRecordSummariesByKeys({
    survey,
    cycle,
    keyValues,
    keyValuesFormatted,
  });
};

type RecordCloneParams = {
  survey: ArenaSurvey;
  user: ArenaUser;
  userGroup?: ArenaUserGroup | null;
};

// the clone belongs to the cloning user and gets the qualifier values of the user's group (as a new record)
const prepareClonedRecord = async ({
  survey,
  record,
  user,
  userGroup,
}: RecordCloneParams & { record: ArenaRecord }) => {
  if (user.uuid) {
    record.ownerUuid = user.uuid;
    record.ownerName = user.name;
  }
  const { record: recordUpdated } =
    await UserGroupQualifiers.assignQualifierValues({
      user,
      survey,
      areaOfInterestProvider: AreaOfInterestProviderDefault,
      appInfo: SystemUtils.getRecordAppInfo(),
      userGroup,
      record,
    });
  const validation = Validations.updateCounts(
    Validations.getValidation(recordUpdated),
  );
  return { ...recordUpdated, validation };
};

const cloneRecordsIntoDefaultCycle = async ({
  survey,
  recordSummaries,
  user,
  userGroup,
}: RecordCloneParams & { recordSummaries: ArenaRecord[] }) => {
  const surveyId = survey.id!;
  const defaultCycle = Surveys.getDefaultCycleKey(survey)!;

  await Promises.each(recordSummaries, async (recordSummary: ArenaRecord) => {
    const { id: recordId } = recordSummary;
    const record = await RecordRepository.fetchRecord({
      survey,
      recordId,
      includeContent: true,
    });
    const { record: recordCloned, newFileUuidsByOldUuid } =
      RecordCloner.cloneRecord({
        survey,
        record,
        cycleTo: defaultCycle,
        sideEffect: true,
      });
    const recordToInsert = await prepareClonedRecord({
      survey,
      record: recordCloned,
      user,
      userGroup,
    });
    await RecordRepository.insertRecord({ survey, record: recordToInsert });

    // clone files
    await Promises.each(
      Object.entries(newFileUuidsByOldUuid),
      async ([oldFileUuid, fileUuid]) => {
        const sourceFileUri = RecordFileService.getRecordFileUri({
          surveyId,
          fileUuid: oldFileUuid,
        });
        await RecordFileService.saveRecordFile({
          surveyId,
          fileUuid,
          sourceFileUri,
        });
      },
    );
  });
};

// Recomputes validation from scratch (full node tree walk, ignoring the possibly stale
// cached validation) for each given record and persists it. Used to reconcile records
// whose displayed error/warning counts no longer match their actual content.
const revalidateRecords = async ({
  user,
  survey,
  recordIds,
}: {
  user: ArenaUser;
  survey: ArenaSurvey;
  recordIds: number[];
}) => {
  await Promises.each(recordIds, async (recordId) => {
    const record = await RecordRepository.fetchRecord({
      survey,
      recordId,
      includeContent: true,
    });
    const validation = Validations.updateCounts(
      await RecordValidator.validateRecord({
        user,
        survey,
        areaOfInterestProvider: AreaOfInterestProviderDefault,
        record,
      }),
    );
    await RecordRepository.updateRecordValidation({
      surveyId: survey.id,
      recordUuid: record.uuid,
      validation,
    });
  });
};

export const RecordLocalService = {
  deleteRecordsAndFiles,
  findFileUuidsInDevice,
  fetchRecordsFilesSize,
  findRecordSummariesByKeys,
  findRecordSummariesWithSameKeys,
  cloneRecordsIntoDefaultCycle,
  revalidateRecords,
};
