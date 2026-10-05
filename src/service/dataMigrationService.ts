import { Promises } from "@openforis/arena-core";

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
          // ignore it
        }
      });
    } catch (error) {
      // ignore id
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
