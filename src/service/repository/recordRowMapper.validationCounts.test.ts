import {
  extractValidationCountsColumnsValues,
  validationFromCountsColumns,
} from "./recordRowMapper";

jest.mock("model", () => ({ RecordSummaries: {}, SurveyDefs: {} }));
jest.mock("utils", () => ({ SystemUtils: {} }));

describe("validation counts columns values", () => {
  test("stored counts are used", () => {
    const validation = { valid: false, counts: { errors: 4, warnings: 2 } };
    expect(extractValidationCountsColumnsValues({ validation })).toEqual([
      4, 2,
    ]);
  });

  test("missing counts are calculated", () => {
    const validation = {
      valid: false,
      fields: {
        n1: { valid: false, errors: [{ key: "required" }] },
        n2: {
          valid: false,
          fields: { n3: { valid: false, warnings: [{ key: "custom" }] } },
        },
      },
    };
    expect(extractValidationCountsColumnsValues({ validation })).toEqual([
      1, 1,
    ]);
  });

  test("no validation: null", () => {
    expect(extractValidationCountsColumnsValues({})).toEqual([null, null]);
    expect(extractValidationCountsColumnsValues(null)).toEqual([null, null]);
  });
});

describe("validation from counts columns", () => {
  test("counts are wrapped in a validation", () => {
    expect(
      validationFromCountsColumns({ errors_count: 2, warnings_count: 0 }),
    ).toEqual({ valid: false, counts: { errors: 2, warnings: 0 } });
    expect(
      validationFromCountsColumns({ errors_count: 0, warnings_count: 0 }),
    ).toEqual({ valid: true, counts: { errors: 0, warnings: 0 } });
  });

  test("no counts: no validation", () => {
    expect(
      validationFromCountsColumns({ errors_count: null, warnings_count: null }),
    ).toBeNull();
  });
});
