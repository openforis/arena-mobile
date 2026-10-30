import { Promises } from "@openforis/arena-core";

import { log } from "utils";

import { RecordService } from "./recordService";
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

const migrateData = async ({ prevDbVersion }: any) => {
  if (prevDbVersion <= 2) {
    await fixRecordCycle();
  }
};

export const DataMigrationService = {
  fixRecordCycle,
  migrateData,
};
