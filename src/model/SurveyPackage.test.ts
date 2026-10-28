import { SurveyPackage } from "./SurveyPackage";

describe("SurveyPackage", () => {
  it("uses the Arena export entry names", () => {
    expect(SurveyPackage.infoFileName).toBe("info.json");
    expect(SurveyPackage.surveyFileName).toBe("survey.json");
    expect(SurveyPackage.getSurveyFileEntryName("abc")).toBe(
      "surveyfiles/abc.bin",
    );
  });

  it("accepts a mobile survey package info", () => {
    expect(SurveyPackage.isSupportedInfo({ exportType: "mobileSurvey" })).toBe(
      true,
    );
  });

  it("accepts a missing info", () => {
    expect(SurveyPackage.isSupportedInfo(null)).toBe(true);
    expect(SurveyPackage.isSupportedInfo(undefined)).toBe(true);
  });

  it("rejects other export types (e.g. a full Arena export)", () => {
    expect(SurveyPackage.isSupportedInfo({ exportType: "survey" })).toBe(false);
    expect(SurveyPackage.isSupportedInfo({ exportType: "records" })).toBe(
      false,
    );
    expect(SurveyPackage.isSupportedInfo({})).toBe(false);
  });
});
