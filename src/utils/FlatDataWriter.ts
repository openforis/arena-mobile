import { Files } from "./Files";

const toString = (val: any): string =>
  val === null || val === undefined ? "" : String(val);

/**
 * Escapes a value for CSV formatting.
 * Wraps in quotes if the value contains commas, newlines, or quotes.
 */
const formatCSVValue = (val: any): string => {
  const stringified = toString(val);
  if (stringified.length > 0 && /[",\n\r]/.test(stringified)) {
    // Escape quotes by doubling them and wrap the value in quotes
    return `"${stringified.replace(/"/g, '""')}"`;
  }
  return stringified;
};

/**
 * Writes CSV headers to a file.
 *
 * @param fileUri - The URI of the file to write to.
 * @param headers - An array of header strings.
 */
const writeCsvHeaders = async ({
  fileUri,
  headers,
}: {
  fileUri: string;
  headers: string[];
}) => {
  const csvContent = headers.map(formatCSVValue).join(",") + "\n";
  await Files.writeStringToFile({
    content: csvContent,
    fileUri,
    encoding: Files.EncodingType.UTF8,
  });
};

/**
 * Appends rows of data to a CSV file.
 *
 * @param fileUri - The URI of the file to append to.
 * @param rows - An array of rows, where each row is an array of values.
 */
const appendCsvRows = async ({
  fileUri,
  rows,
}: {
  fileUri: string;
  rows: any[][];
}) => {
  const csvRows =
    rows.map((row) => row.map(formatCSVValue).join(",")).join("\n") + "\n";
  await Files.appendStringToFile({
    content: csvRows,
    fileUri,
    encoding: Files.EncodingType.UTF8,
  });
};

export const FlatDataWriter = {
  writeCsvHeaders,
  appendCsvRows,
};
