import { DataEntrySelectors } from "./selectors";

let mockPreviewActive = false;

// getter: the mock factory runs before this module's variables are initialized
jest.mock("utils/PreviewMode", () => ({
  PreviewMode: {
    get isActive() {
      return mockPreviewActive;
    },
  },
}));
jest.mock("model", () => ({}));
jest.mock("service", () => ({ SurveyService: {} }));
jest.mock("localization", () => ({}));

// survey with 2 cycles: the default one is the last one ("1")
const survey = { props: { cycles: { "0": {}, "1": {} } } };

const createState = (recordCycle: string, readOnly = false) => ({
  survey: { currentSurvey: survey },
  dataEntry: { record: { cycle: recordCycle, readOnly } },
});

describe("selectCanEditRecord", () => {
  afterEach(() => {
    mockPreviewActive = false;
  });

  test("record in the default cycle is editable", () => {
    expect(DataEntrySelectors.selectCanEditRecord(createState("1"))).toBe(true);
  });

  test("record in another cycle is read-only", () => {
    expect(DataEntrySelectors.selectCanEditRecord(createState("0"))).toBe(
      false,
    );
  });

  test("record of another user group is read-only", () => {
    expect(DataEntrySelectors.selectCanEditRecord(createState("1", true))).toBe(
      false,
    );
  });

  test("web preview: record in another cycle is editable", () => {
    mockPreviewActive = true;
    expect(DataEntrySelectors.selectCanEditRecord(createState("0"))).toBe(true);
  });
});
