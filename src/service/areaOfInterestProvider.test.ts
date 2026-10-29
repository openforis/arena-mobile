import { Files } from "utils/Files";

import { AreaOfInterestProviderDefault } from "./areaOfInterestProvider";

jest.mock("utils/Files", () => ({ Files: { readJsonFromFile: jest.fn() } }));

jest.mock("./repository/surveyFSRepository", () => ({
  SurveyFSRepository: {
    getSurveyPackageFileUri: ({ surveyId, fileUuid }: any) =>
      `${surveyId}/surveyfiles/${fileUuid}.bin`,
  },
}));

const readJsonFromFileMock = Files.readJsonFromFile as jest.Mock;

const polygon = {
  type: "Polygon",
  coordinates: [
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 0],
    ],
  ],
};

const newSurvey = (id: number): any => ({
  id,
  props: {
    areasOfInterest: [
      { name: "valid", fileUuid: "file-valid" },
      { name: "invalid", fileUuid: "file-invalid" },
    ],
  },
});

const contentByUri: Record<string, any> = {
  "1/surveyfiles/file-valid.bin": polygon,
  "1/surveyfiles/file-invalid.bin": { type: "Point", coordinates: [0, 0] },
  "2/surveyfiles/file-valid.bin": polygon,
};

const { getAreaOfInterest } = AreaOfInterestProviderDefault;

describe("AreaOfInterestProviderDefault", () => {
  beforeEach(() => {
    readJsonFromFileMock.mockReset();
    readJsonFromFileMock.mockImplementation(
      async ({ fileUri }: any) => contentByUri[fileUri] ?? null,
    );
  });

  test("reads the area file once and then uses the cache", async () => {
    const survey = newSurvey(1);
    expect(await getAreaOfInterest({ survey, name: "valid" })).toEqual(polygon);
    expect(await getAreaOfInterest({ survey, name: "valid" })).toEqual(polygon);
    expect(readJsonFromFileMock).toHaveBeenCalledTimes(1);
  });

  test("returns undefined for unknown names, non polygon content and missing files", async () => {
    expect(
      await getAreaOfInterest({ survey: newSurvey(1), name: "unknown" }),
    ).toBeUndefined();
    expect(
      await getAreaOfInterest({ survey: newSurvey(1), name: "invalid" }),
    ).toBeUndefined();
    expect(
      await getAreaOfInterest({ survey: newSurvey(3), name: "valid" }),
    ).toBeUndefined();
  });

  test("reads the file of the other survey when the survey changes", async () => {
    await getAreaOfInterest({ survey: newSurvey(1), name: "valid" });
    await getAreaOfInterest({ survey: newSurvey(2), name: "valid" });
    expect(readJsonFromFileMock).toHaveBeenLastCalledWith({
      fileUri: "2/surveyfiles/file-valid.bin",
    });
  });
});
