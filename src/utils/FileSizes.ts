// no native dependencies, so it can be used in model utils
const fileSizeUnits = ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

const toHumanReadableFileSize = (
  bytesParam: number | undefined,
  { decimalPlaces = 1 } = {},
): string => {
  // undefined yields "NaN" like before
  let bytes = bytesParam as number;
  const threshold = 1024;

  if (Math.abs(bytes) < threshold) {
    return bytes + " B";
  }

  let unitIndex = -1;
  const ratio = 10 ** decimalPlaces;

  do {
    bytes /= threshold;
    ++unitIndex;
  } while (
    Math.round(Math.abs(bytes) * ratio) / ratio >= threshold &&
    unitIndex < fileSizeUnits.length - 1
  );

  return bytes.toFixed(decimalPlaces) + " " + fileSizeUnits[unitIndex];
};

export const FileSizes = {
  toHumanReadableFileSize,
};
