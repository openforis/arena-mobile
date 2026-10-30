import { RecordFileRepository } from "./recordFileRepository";

jest.mock("utils", () => ({ Files: {} }));
jest.mock("./genericFileRepository", () => ({
  GenericFileRepository: { getDirUri: (name: string) => `file:///${name}` },
}));

const surveyId = 1;

describe("RecordFileRepository.getRecordFileUri", () => {
  it("returns the uri of a valid file uuid", () => {
    const fileUuid = "0f5c1e1a-7c3a-4b7e-9d43-2f3d5a1c9e10";
    expect(RecordFileRepository.getRecordFileUri({ surveyId, fileUuid })).toBe(
      `file:///survey_record_files/1/${fileUuid}`,
    );
  });

  it.each(["..", "../..", "../2/x", "a/b", "", ".hidden"])(
    "rejects %p",
    (fileUuid) => {
      expect(() =>
        RecordFileRepository.getRecordFileUri({ surveyId, fileUuid }),
      ).toThrow("invalid file uuid");
    },
  );
});
