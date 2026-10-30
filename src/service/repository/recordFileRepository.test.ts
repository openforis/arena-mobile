import { GenericFileRepository } from "./genericFileRepository";
import { RecordFileRepository } from "./recordFileRepository";

jest.mock("utils", () => ({ Files: {} }));
jest.mock("./genericFileRepository", () => ({
  GenericFileRepository: {
    getDirUri: (name: string) => `file:///${name}`,
    deleteFile: jest.fn(),
    makeDirIfNotExists: jest.fn(),
    copyFile: jest.fn(),
  },
}));

const surveyId = 1;
const invalidFileUuids = ["..", "../..", "../2/x", "a/b", "", ".hidden"];

describe("RecordFileRepository", () => {
  beforeEach(() => jest.clearAllMocks());

  it("accepts a valid file uuid", async () => {
    const fileUuid = "0f5c1e1a-7c3a-4b7e-9d43-2f3d5a1c9e10";
    await RecordFileRepository.deleteRecordFile({ surveyId, fileUuid });
    expect(GenericFileRepository.deleteFile).toHaveBeenCalledWith(
      `file:///survey_record_files/1/${fileUuid}`,
    );
  });

  it.each(invalidFileUuids)("does not delete %p", async (fileUuid) => {
    await expect(
      RecordFileRepository.deleteRecordFile({ surveyId, fileUuid }),
    ).rejects.toThrow("invalid file uuid");
    expect(GenericFileRepository.deleteFile).not.toHaveBeenCalled();
  });

  it.each(invalidFileUuids)("does not save %p", async (fileUuid) => {
    await expect(
      RecordFileRepository.saveRecordFile({
        surveyId,
        fileUuid,
        sourceFileUri: "file:///source",
      }),
    ).rejects.toThrow("invalid file uuid");
    expect(GenericFileRepository.copyFile).not.toHaveBeenCalled();
  });

  it("still builds the uri of a stored value, for reading", () => {
    expect(() =>
      RecordFileRepository.getRecordFileUri({ surveyId, fileUuid: ".." }),
    ).not.toThrow();
  });
});
