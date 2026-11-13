import { getRecordFixKey, isRowToBeFixed } from "./recordRowMapper";

jest.mock("model", () => ({ RecordSummaries: {}, SurveyDefs: {} }));
jest.mock("utils", () => ({
  SystemUtils: { getRecordAppInfo: () => ({ version: "2.12.0" }) },
}));

const survey = { datePublished: "2026-11-01T10:00:00.000Z" };
const fixKey = getRecordFixKey(survey);
const content = JSON.stringify({ uuid: "r1", nodes: {} });

describe("record fix key", () => {
  test("depends on the survey and the app version", () => {
    expect(fixKey).toBe("2026-11-01T10:00:00.000Z|2.12.0");
  });

  test("unknown survey version: no key", () => {
    expect(getRecordFixKey({})).toBeNull();
  });

  test("content never fixed is fixed", () => {
    expect(isRowToBeFixed({ row: { content, fixed_for: null }, fixKey })).toBe(
      true,
    );
  });

  test("content already fixed for the same survey and app version is not fixed again", () => {
    expect(
      isRowToBeFixed({ row: { content, fixed_for: fixKey }, fixKey }),
    ).toBe(false);
  });

  test("content fixed for another survey or app version is fixed again", () => {
    const row = { content, fixed_for: "2026-10-01T10:00:00.000Z|2.11.2" };
    expect(isRowToBeFixed({ row, fixKey })).toBe(true);
  });

  test("without a key the content is always fixed", () => {
    expect(
      isRowToBeFixed({ row: { content, fixed_for: fixKey }, fixKey: null }),
    ).toBe(true);
  });

  test("summaries (no content) are not fixed", () => {
    expect(isRowToBeFixed({ row: { content: "{}" }, fixKey })).toBe(false);
  });
});
