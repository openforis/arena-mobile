const truncateWithEllipsis = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength - 3)}...`;
};

export const StringUtils = {
  truncateWithEllipsis,
};
