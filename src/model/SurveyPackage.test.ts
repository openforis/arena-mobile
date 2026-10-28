import { SurveyPackage } from "./SurveyPackage";

describe("SurveyPackage", () => {
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
