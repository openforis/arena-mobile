// "?, ?, ?" for a SQL IN list or VALUES clause; bind the values as params
const placeholders = (values: readonly unknown[]): string =>
  values.map(() => "?").join(", ");

export const DbUtils = {
  placeholders,
};
