const quoteValue = (val: any) => `'${String(val).replaceAll("'", "''")}'`;

// values can come from imported files: a double quoted value would be read as a column name
const quoteValues = (values: any) => values.map(quoteValue).toString();

export const DbUtils = {
  quoteValues,
};
