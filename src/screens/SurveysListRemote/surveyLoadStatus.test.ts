import { getSurveyLoadStatusKey } from "./surveyLoadStatus";

const older = "2024-01-01T10:00:00.000Z";
const newer = "2024-06-01T10:00:00.000Z";

describe("getSurveyLoadStatusKey", () => {
  test("not in device", () => {
    expect(getSurveyLoadStatusKey({ survey: { datePublished: newer } })).toBe(
      "surveys:loadStatus.notInDevice",
    );
  });

  test("updated when the remote survey was published later", () => {
    expect(
      getSurveyLoadStatusKey({
        survey: { datePublished: newer },
        localSurvey: { datePublished: older },
      }),
    ).toBe("surveys:loadStatus.updated");
  });

  test("up to date", () => {
    expect(
      getSurveyLoadStatusKey({
        survey: { datePublished: older },
        localSurvey: { datePublished: older },
      }),
    ).toBe("surveys:loadStatus.upToDate");
  });
});
