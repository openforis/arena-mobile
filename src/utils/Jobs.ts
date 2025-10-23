import { ValidationResult } from "@openforis/arena-core";
import {
  Validation,
  ValidationFields,
} from "@openforis/arena-core/dist/validation/validation";

const extractErrorMessage = ({
  errors,
  t,
}: {
  errors: ValidationFields;
  t: any;
}): string => {
  const firstLevelErrors = Object.values(errors);
  const secondLevelErrors: Validation[] = firstLevelErrors.flatMap(
    (firstLevelError) => Object.values(firstLevelError)
  );
  const errorItems: ValidationResult[] = secondLevelErrors.reduce(
    (acc, secondLevelError: Validation) => {
      acc.push(...(secondLevelError.errors ?? []));
      return acc;
    },
    [] as ValidationResult[]
  );
  return errorItems
    .reduce((acc: any, errorItem: ValidationResult) => {
      const { key, params } = errorItem;
      if (key) {
        const messageKey =
          key === "appErrors.generic" ? "validation:appErrors.generic" : key;
        const errorMessage = t(messageKey, params);
        acc.push(errorMessage);
      }
      return acc;
    }, [])
    .join("\n");
};

export const Jobs = {
  extractErrorMessage,
};
