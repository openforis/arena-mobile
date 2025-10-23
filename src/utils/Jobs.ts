const extractErrorMessage = ({ errors, t }) => {
  const firstLevelErrors = Object.values(errors);
  const secondLevelErrors = firstLevelErrors.flatMap((firstLevelError) =>
    Object.values(firstLevelError)
  );
  const errorItems = secondLevelErrors.reduce((acc, secondLevelError) => {
    acc.push(...(secondLevelError.errors ?? []));
    return acc;
  }, []);
  return errorItems
    .reduce((acc, errorItem) => {
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
