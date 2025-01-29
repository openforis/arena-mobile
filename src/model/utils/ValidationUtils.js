import { Objects, ValidationSeverity } from "@openforis/arena-core";

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

const traverseValidation =
  ({ visitor }) =>
  (validation) => {
    const stack = [];
    stack.push(validation);

    while (stack.length > 0) {
      const v = stack.pop();
      if (visitor(v) !== false) {
        stack.push(...Object.values(v.fields ?? {}));
      }
    }
  };

const getJointTexts = ({ validation, severity, t, customMessageLang }) => {
  const result = [];

  traverseValidation({
    visitor: (v) => {
      const validationResults =
        severity === ValidationSeverity.error ? v.errors : v.warnings;
      const messages =
        validationResults?.map(
          validationResultToMessage({ customMessageLang, t })
        ) ?? [];
      result.push(...messages);
    },
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

const isValid = (validation) => Objects.isEmpty(validation) || validation.valid;
const isNotValid = (validation) => !isValid(validation);

const isError = (validation) =>
  validation?.errors?.length > 0 ||
  Object.values(validation?.fields ?? {}).some(isError);
const isWarning = (validation) => validation?.warnings?.length > 0;

const findInnerValidation =
  ({ predicate }) =>
  (validation) => {
    let result = false;
    traverseValidation({
      visitor: (v) => {
        if (predicate(v)) {
          result = true;
          return false; // break validation traversing
        }
      },
    })(validation);
    return result;
  };

const hasNestedErrors = findInnerValidation({ predicate: isError });
const hasNestedWarnings = findInnerValidation({ predicate: isWarning });

export const ValidationUtils = {
  getJointErrorText,
  getJointWarningText,
  isValid,
  isNotValid,
  isError,
  isWarning,
  hasNestedErrors,
  hasNestedWarnings,
};
