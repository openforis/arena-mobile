// order-independent: changes only when the set of keys changes
export const getItemKeysSignature = (items: { key: any }[]): string =>
  items
    .map((item) => String(item.key))
    .sort()
    .join("\n");
