import { Promises } from "@openforis/arena-core";

import { log } from "utils";

import { RecordService } from "./recordService";
import { SurveyRepository } from "./repository/surveyRepository";
import { SurveyService } from "./surveyService";

const fixRecordCycle = async () => {
  const surveySummaries = await SurveyService.fetchSurveySummariesLocal();
  await Promises.each(surveySummaries, async (surveySummary) => {
    try {
      const surveyId = surveySummary.id;
      const survey = await SurveyService.fetchSurveyById(surveyId);
      const records = await RecordService.fetchRecordsWithEmptyCycle({
        survey,
      });
      await Promises.each(records, async (recordSummary) => {
        try {
          const { id: recordId } = recordSummary;
          await RecordService.fixRecordCycle({ survey, recordId });
        } catch (error) {
          log.warn(
            `error fixing cycle of record ${recordSummary.id}: ${error}`,
          );
        }
      });
    } catch (error) {
      log.warn(
        `error fixing records cycle in survey ${surveySummary.id}: ${error}`,
      );
    }
  });
};

// description column added by DB migration 9: filled from the survey files
const backfillSurveyDescriptions = async () => {
  const surveySummaries = await SurveyService.fetchSurveySummariesLocal();
  await Promises.each(surveySummaries, async ({ id }) => {
    try {
      const survey = await SurveyService.fetchSurveyById(id);
      await SurveyRepository.updateSurveyDescription({ id, survey });
    } catch (error) {
      log.warn(`error setting description of survey ${id}: ${error}`);
    }
  });
};

const migrateData = async ({
  prevDbVersion,
}: {
  prevDbVersion: number | undefined;
}) => {
  if (prevDbVersion !== undefined && prevDbVersion <= 2) {
    await fixRecordCycle();
  }
  if (prevDbVersion !== undefined && prevDbVersion < 9) {
    await backfillSurveyDescriptions();
  }
};

export const DataMigrationService = {
  backfillSurveyDescriptions,
  fixRecordCycle,
  migrateData,
};
