import { NodeDef, NodeDefType, Survey } from "@openforis/arena-core";

import { RecordCompletion } from "./RecordCompletion";
import { RecordValueFormatters } from "./RecordValueFormatters";

const { formatBooleanValue, formatCoordinateValue, formatFileValue } =
  RecordValueFormatters;

const t = (key: string) => key;

const booleanDef = (labelValue?: string) =>
  ({
    type: NodeDefType.boolean,
    props: { name: "flag", labelValue },
  }) as unknown as NodeDef<NodeDefType>;

const surveyWithSrsCodes = (...codes: string[]) =>
  ({ props: { srs: codes.map((code) => ({ code })) } }) as unknown as Survey;

describe("RecordValueFormatters.formatBooleanValue", () => {
  test("empty value", () => {
    expect(formatBooleanValue({ nodeDef: booleanDef(), value: null, t })).toBe(
      "",
    );
  });

  test("true/false labels by default", () => {
    expect(
      formatBooleanValue({ nodeDef: booleanDef(), value: "true", t }),
    ).toBe("common:true");
    expect(
      formatBooleanValue({ nodeDef: booleanDef(), value: "false", t }),
    ).toBe("common:false");
  });

  test("yes/no labels", () => {
    expect(
      formatBooleanValue({ nodeDef: booleanDef("yesNo"), value: true, t }),
    ).toBe("common:yes");
    expect(
      formatBooleanValue({ nodeDef: booleanDef("yesNo"), value: "false", t }),
    ).toBe("common:no");
  });
});

describe("RecordValueFormatters.formatCoordinateValue", () => {
  test("empty value", () => {
    expect(
      formatCoordinateValue({ survey: surveyWithSrsCodes("4326"), value: {} }),
    ).toBe("");
  });

  test("lat long rounded to 5 decimals, single SRS omitted", () => {
    expect(
      formatCoordinateValue({
        survey: surveyWithSrsCodes("4326"),
        value: { x: 12.1234567, y: "41.7654321", srs: "4326" },
      }),
    ).toBe("12.12346, 41.76543");
  });

  test("projected rounded to 2 decimals, SRS shown with many SRSs", () => {
    expect(
      formatCoordinateValue({
        survey: surveyWithSrsCodes("4326", "32633"),
        value: { x: 500000.456, y: 4600000.123, srs: "32633" },
      }),
    ).toBe("500000.46, 4600000.12 (32633)");
  });
});

describe("RecordValueFormatters.formatFileValue", () => {
  test("calculated file name has priority", () => {
    expect(
      formatFileValue({
        value: { fileName: "a.jpg", fileNameCalculated: "plot_1.jpg" },
      }),
    ).toBe("plot_1.jpg");
  });

  test("meaningful file name", () => {
    expect(formatFileValue({ value: { fileName: "photo.jpg" } })).toBe(
      "photo.jpg",
    );
  });

  test("generated file name replaced by extension and size", () => {
    expect(
      formatFileValue({
        value: {
          fileName: "0f8fad5b-d9cb-469f-a165-70867728950e.jpg",
          fileSize: 100,
        },
      }),
    ).toBe("JPG 100 B");
  });

  test("empty value", () => {
    expect(formatFileValue({ value: null })).toBe("");
  });
});

describe("RecordCompletion.toCompletionPercent", () => {
  test("rounded percent", () => {
    expect(RecordCompletion.toCompletionPercent({ total: 3, filled: 1 })).toBe(
      33,
    );
  });

  test("nothing to fill is complete", () => {
    expect(RecordCompletion.toCompletionPercent({ total: 0, filled: 0 })).toBe(
      100,
    );
  });
});
