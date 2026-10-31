import { RecordFileService } from "./recordFileService";
import { SurveyFSRepository } from "./repository/surveyFSRepository";
import { SurveyRepository } from "./repository/surveyRepository";
import { SurveyService } from "./surveyService";

jest.mock("./repository/surveyRepository", () => ({
  SurveyRepository: { deleteSurveys: jest.fn() },
}));
jest.mock("./repository/surveyFSRepository", () => ({
  SurveyFSRepository: { deleteSurveyFile: jest.fn() },
}));
jest.mock("./recordFileService", () => ({
  RecordFileService: { deleteSurveyRecordFiles: jest.fn() },
}));
jest.mock("./remoteService", () => ({ RemoteService: {} }));
jest.mock("utils", () => ({ Files: {}, log: { warn: jest.fn() } }));

const deleteSurveyFileMock = SurveyFSRepository.deleteSurveyFile as jest.Mock;
const deleteRecordFilesMock =
  RecordFileService.deleteSurveyRecordFiles as jest.Mock;

describe("SurveyService.deleteSurveys", () => {
  beforeEach(() => jest.clearAllMocks());

  it("does not fail when the files cannot be deleted", async () => {
    deleteSurveyFileMock.mockRejectedValue(new Error("missing"));
    deleteRecordFilesMock.mockRejectedValue(new Error("missing"));

    await expect(SurveyService.deleteSurveys([1, 2])).resolves.toBeUndefined();

    expect(SurveyRepository.deleteSurveys).toHaveBeenCalledWith([1, 2]);
    expect(deleteRecordFilesMock).toHaveBeenCalledTimes(2);
  });

  it("keeps the files if the survey cannot be deleted", async () => {
    (SurveyRepository.deleteSurveys as jest.Mock).mockRejectedValueOnce(
      new Error("db"),
    );

    await expect(SurveyService.deleteSurveys([1])).rejects.toThrow("db");

    expect(deleteRecordFilesMock).not.toHaveBeenCalled();
  });
});
