import { Survey } from "@openforis/arena-core";

const prefix = "arenaMobilePreview/";

export const PreviewMessageType = {
  ready: `${prefix}ready`,
  survey: `${prefix}survey`,
  error: `${prefix}error`,
} as const;

export type PreviewSurveyMessage = {
  type: typeof PreviewMessageType.survey;
  survey: Survey;
  lang?: string;
  cycle?: string;
};

export type PreviewOutgoingMessage =
  | { type: typeof PreviewMessageType.ready }
  | { type: typeof PreviewMessageType.error; message: string };

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

const isOptionalString = (value: unknown): boolean =>
  value === undefined || value === null || isNonEmptyString(value);

const isSurvey = (value: unknown): value is Survey => {
  const survey = value as Survey | null;
  return (
    !!survey &&
    typeof survey === "object" &&
    isNonEmptyString(survey.uuid) &&
    !!survey.nodeDefs &&
    typeof survey.nodeDefs === "object"
  );
};

const isPreviewSurveyMessage = (
  data: unknown,
): data is PreviewSurveyMessage => {
  const message = data as PreviewSurveyMessage | null;
  return (
    !!message &&
    typeof message === "object" &&
    message.type === PreviewMessageType.survey &&
    isSurvey(message.survey) &&
    isOptionalString(message.lang) &&
    isOptionalString(message.cycle)
  );
};

export const PreviewProtocol = {
  isPreviewSurveyMessage,
};
