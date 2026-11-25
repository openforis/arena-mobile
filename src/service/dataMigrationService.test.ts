import { DataMigrationService } from "./dataMigrationService";
import { RecordService } from "./recordService";
import { SurveyRepository } from "./repository/surveyRepository";
import { SurveyService } from "./surveyService";

jest.mock("./surveyService", () => ({
  SurveyService: {
    fetchSurveySummariesLocal: jest.fn(),
    fetchSurveyById: jest.fn(),
  },
}));
jest.mock("./recordService", () => ({
  RecordService: {
    fetchRecordsWithEmptyCycle: jest.fn(async () => []),
    fixRecordCycle: jest.fn(),
  },
}));
jest.mock("./repository/surveyRepository", () => ({
  SurveyRepository: { updateSurveyDescription: jest.fn() },
}));
jest.mock("utils", () => ({ log: { warn: jest.fn() } }));

const fetchSurveyByIdMock = SurveyService.fetchSurveyById as jest.Mock;
const updateSurveyDescriptionMock =
  SurveyRepository.updateSurveyDescription as jest.Mock;

// only the properties read by the data migration
const surveysById: Record<number, object> = {
  1: { id: 1, props: { descriptions: { en: "First" } } },
  2: { id: 2, props: {} },
};

describe("DataMigrationService.migrateData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (SurveyService.fetchSurveySummariesLocal as jest.Mock).mockResolvedValue([
      { id: 1 },
      { id: 2 },
      { id: 3 },
    ]);
    fetchSurveyByIdMock.mockImplementation(async (id: number) => {
      if (!surveysById[id]) throw new Error("missing survey file");
      return surveysById[id];
    });
  });

  it("fills the survey descriptions when migrating from a version before 9", async () => {
    await DataMigrationService.migrateData({ prevDbVersion: 8 });

    // a survey that cannot be read is skipped
    expect(updateSurveyDescriptionMock.mock.calls).toEqual([
      [{ id: 1, survey: surveysById[1] }],
      [{ id: 2, survey: surveysById[2] }],
    ]);
    expect(RecordService.fetchRecordsWithEmptyCycle).not.toHaveBeenCalled();
  });

  it("does not fill the descriptions again", async () => {
    await DataMigrationService.migrateData({ prevDbVersion: 9 });
    await DataMigrationService.migrateData({ prevDbVersion: undefined });

    expect(updateSurveyDescriptionMock).not.toHaveBeenCalled();
  });
});
