import { SurveyFSRepository } from "./surveyFSRepository";

const mockFiles = new Map<string, string>();

jest.mock("utils/Files", () => ({
  Files: {
    exists: async (uri: string) => mockFiles.has(uri),
    moveFile: async ({ from, to }: { from: string; to: string }) => {
      mockFiles.set(to, mockFiles.get(from)!);
      mockFiles.delete(from);
    },
    readJsonFromFile: async ({ fileUri }: { fileUri: string }) =>
      mockFiles.has(fileUri) ? JSON.parse(mockFiles.get(fileUri)!) : null,
  },
}));
jest.mock("./genericFileRepository", () => ({
  GenericFileRepository: { getDirUri: (dir: string) => `file:///${dir}` },
}));

const fileUri = "file:///survey_files/1.json";

beforeEach(() => mockFiles.clear());

describe("SurveyFSRepository.readSurveyFile", () => {
  it("recovers the survey from the temp file left by an interrupted move", async () => {
    mockFiles.set(`${fileUri}.tmp`, '{"id":1}');
    expect(await SurveyFSRepository.readSurveyFile({ surveyId: 1 })).toEqual({
      id: 1,
    });
    expect([...mockFiles.keys()]).toEqual([fileUri]);
  });

  it("ignores a temp file when the survey file exists", async () => {
    mockFiles.set(fileUri, '{"id":1}');
    mockFiles.set(`${fileUri}.tmp`, '{"id":2}');
    expect(await SurveyFSRepository.readSurveyFile({ surveyId: 1 })).toEqual({
      id: 1,
    });
  });
});
