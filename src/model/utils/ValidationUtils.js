import {
  Objects,
  Validations,
  ValidationSeverity,
} from "@openforis/arena-core";

const customValidationKey = "record.attribute.customValidation";

const validationResultToMessage =
  ({ customMessageLang, t }) =>
  (validationResult) => {
    const { key, params, messages } = validationResult;
    if (key === customValidationKey) {
      const message = messages[customMessageLang];
      if (message) {
        return message;
      }
    }
    return t(`validation:${key}`, params);
  };

const getJointTexts = ({ validation, severity, t, customMessageLang }) => {
  const result = [];

  Validations.traverse((v) => {
    const validationResults =
      severity === ValidationSeverity.error ? v.errors : v.warnings;
    const messages =
      validationResults?.map(
        validationResultToMessage({ customMessageLang, t })
      ) ?? [];
    result.push(...messages);
  })(validation);

  return result.length > 0 ? result.join(", ") : null;
};

const getJointErrorText = ({ validation, t, customMessageLang }) =>
  getJointTexts({
    validation,
    severity: ValidationSeverity.error,
    t,
    customMessageLang,
  });

const getJointWarningText = ({ validation, t, customMessageLang }) =>
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
