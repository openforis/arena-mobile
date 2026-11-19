import {
  ArenaValidation,
  ArenaValidationFields,
  ArenaValidationResult,
} from "@openforis/arena-core";

const extractErrorMessage = ({
  errors,
  t,
}: {
  errors: ArenaValidationFields;
  t: any;
}): string => {
  const firstLevelErrors = Object.values(errors);
  const secondLevelErrors: ArenaValidation[] = firstLevelErrors.flatMap(
    (firstLevelError) => Object.values(firstLevelError),
  );
  const errorItems: ArenaValidationResult[] = secondLevelErrors.reduce(
    (acc, secondLevelError: ArenaValidation) => {
      acc.push(...(secondLevelError.errors ?? []));
      return acc;
    },
    [] as ArenaValidationResult[],
  );
  return errorItems
    .reduce((acc: any, errorItem: ArenaValidationResult) => {
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
