import {
  ArenaValidation,
  ArenaValidationResult,
  LanguageCode,
  Validations,
  ValidationSeverity,
} from "@openforis/arena-core";

export type ValidationTranslateFunction = (
  key: string,
  params?: Record<string, unknown>,
) => string;

type JointTextsParams = {
  validation: ArenaValidation;
  t: ValidationTranslateFunction;
  // language of the custom validation messages
  customMessageLang?: string;
};

const customValidationKey = "record.attribute.customValidation";

const validationResultToMessage =
  ({ customMessageLang, t }: Omit<JointTextsParams, "validation">) =>
  (validationResult: ArenaValidationResult): string => {
    const { key, params, messages } = validationResult;
    if (key === customValidationKey) {
      const message = messages?.[customMessageLang as LanguageCode];
      if (message) {
        return message;
      }
    }
    return t(`validation:${key}`, params);
  };

const getJointTexts = ({
  validation,
  severity,
  t,
  customMessageLang,
}: JointTextsParams & { severity: ValidationSeverity }) => {
  const result: string[] = [];

  Validations.traverse((v) => {
    const validationResults =
      severity === ValidationSeverity.error ? v.errors : v.warnings;
    const messages =
      validationResults?.map(
        validationResultToMessage({ customMessageLang, t }),
      ) ?? [];
    result.push(...messages);
  })(validation);

  // typed loosely: callers don't handle null yet
  return (result.length > 0 ? result.join(", ") : null) as any;
};

const getJointErrorText = ({
  validation,
  t,
  customMessageLang,
}: JointTextsParams) =>
  getJointTexts({
    validation,
    severity: ValidationSeverity.error,
    t,
    customMessageLang,
  });

const getJointWarningText = ({
  validation,
  t,
  customMessageLang,
}: JointTextsParams) =>
  getJointTexts({
    validation,
    severity: ValidationSeverity.warning,
    t,
    customMessageLang,
  });

export const ValidationUtils = {
  getJointErrorText,
  getJointWarningText,
};
