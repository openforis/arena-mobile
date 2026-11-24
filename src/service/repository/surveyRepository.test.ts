import { dbClient } from "db";

import { SurveyRepository } from "./surveyRepository";

jest.mock("utils", () =>
  jest
    .requireActual("service/repository/testing/repositoryTestMocks")
    .utilsMock(),
);
jest.mock("model", () =>
  jest
    .requireActual("service/repository/testing/repositoryTestMocks")
    .modelMock(),
);
jest.mock("db", () =>
  jest.requireActual("service/repository/testing/repositoryTestMocks").dbMock(),
);

const buildSurvey = ({
  uuid = "s1",
  descriptions,
}: {
  uuid?: string;
  descriptions?: Record<string, string>;
}): any => ({
  id: 10,
  uuid,
  dateCreated: "2026-01-01T10:00:00.000Z",
  datePublished: "2026-01-02T10:00:00.000Z",
  props: {
    name: `survey_${uuid}`,
    languages: ["fr", "en"],
    labels: { en: "Survey", fr: "Enquête" },
    descriptions,
  },
});

const fetchSummary = async (id: number) =>
  (await SurveyRepository.fetchSurveySummaries()).find(
    (summary) => summary.id === id,
  )!;

describe("survey description column", () => {
  beforeAll(async () => {
    await dbClient.runMigrationsIfNecessary();
  });

  test("insertSurvey stores the description in the default language", async () => {
    const { id } = await SurveyRepository.insertSurvey(
      buildSurvey({ descriptions: { en: "English", fr: "Français" } }),
    );
    expect(await fetchSummary(id!)).toMatchObject({
      label: "Enquête",
      description: "Français",
    });
  });

  test("a survey without description in the default language gets null", async () => {
    const { id } = await SurveyRepository.insertSurvey(
      buildSurvey({ uuid: "s2", descriptions: { en: "English only" } }),
    );
    expect((await fetchSummary(id!)).description).toBeNull();

    const { id: id3 } = await SurveyRepository.insertSurvey(
      buildSurvey({ uuid: "s3" }),
    );
    expect((await fetchSummary(id3!)).description).toBeNull();
  });

  test("updateSurvey updates the description", async () => {
    const { id } = await SurveyRepository.insertSurvey(
      buildSurvey({ uuid: "s4", descriptions: { fr: "Avant" } }),
    );
    await SurveyRepository.updateSurvey({
      id: id!,
      survey: buildSurvey({ uuid: "s4", descriptions: { fr: "Après" } }),
    });
    expect((await fetchSummary(id!)).description).toBe("Après");

    await SurveyRepository.updateSurvey({
      id: id!,
      survey: buildSurvey({ uuid: "s4", descriptions: { fr: "" } }),
    });
    expect((await fetchSummary(id!)).description).toBeNull();
  });

  test("updateSurveyDescription sets only the description", async () => {
    const { id } = await SurveyRepository.insertSurvey(
      buildSurvey({ uuid: "s5" }),
    );
    const summaryBefore = await fetchSummary(id!);
    await SurveyRepository.updateSurveyDescription({
      id: id!,
      survey: buildSurvey({ uuid: "s5", descriptions: { fr: "Nouvelle" } }),
    });
    expect(await fetchSummary(id!)).toEqual({
      ...summaryBefore,
      description: "Nouvelle",
    });
  });
});
