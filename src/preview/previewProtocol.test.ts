import { PreviewMessageType, PreviewProtocol } from "./previewProtocol";

const survey = { uuid: "survey-uuid", nodeDefs: {} };

describe("PreviewProtocol.isPreviewSurveyMessage", () => {
  test("accepts a survey message", () => {
    expect(
      PreviewProtocol.isPreviewSurveyMessage({
        type: PreviewMessageType.survey,
        survey,
        lang: "en",
        cycle: "0",
      }),
    ).toBe(true);
  });

  test("accepts a survey message without lang and cycle", () => {
    expect(
      PreviewProtocol.isPreviewSurveyMessage({
        type: PreviewMessageType.survey,
        survey,
      }),
    ).toBe(true);
  });

  test.each([
    ["null", null],
    ["a string", "arenaMobilePreview/survey"],
    ["another message type", { type: PreviewMessageType.ready, survey }],
    ["a missing survey", { type: PreviewMessageType.survey }],
    [
      "a survey without uuid",
      { type: PreviewMessageType.survey, survey: { nodeDefs: {} } },
    ],
    [
      "a survey without node defs",
      { type: PreviewMessageType.survey, survey: { uuid: "survey-uuid" } },
    ],
    ["an invalid lang", { type: PreviewMessageType.survey, survey, lang: 1 }],
  ])("rejects %s", (_description, data) => {
    expect(PreviewProtocol.isPreviewSurveyMessage(data)).toBe(false);
  });
});
