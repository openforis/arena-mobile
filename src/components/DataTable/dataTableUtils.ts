// order-independent: changes only when the set of keys changes
export const getItemKeysSignature = (items: { key: unknown }[]): string =>
  items
    .map((item) => String(item.key))
    .sort((keyA, keyB) => keyA.localeCompare(keyB))
    .join("\n");
