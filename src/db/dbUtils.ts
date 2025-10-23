const quoteValues = (values: any) => values.map((val: any) => `"${val}"`).toString();

export const DbUtils = {
  quoteValues,
};
