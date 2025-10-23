const quoteValues = (values) => values.map((val) => `"${val}"`).toString();

export const DbUtils = {
  quoteValues,
};
