const extractErrorMessage = ({
  errors,
  t
}: any) => {
  const firstLevelErrors = Object.values(errors);
  const secondLevelErrors = firstLevelErrors.flatMap((firstLevelError) =>
    // @ts-expect-error TS(2769): No overload matches this call.
    Object.values(firstLevelError)
  );
  const errorItems = secondLevelErrors.reduce((acc, secondLevelError) => {
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    acc.push(...(secondLevelError.errors ?? []));
    return acc;
  }, []);
  // @ts-expect-error TS(2571): Object is of type 'unknown'.
  return errorItems
    .reduce((acc: any, errorItem: any) => {
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
