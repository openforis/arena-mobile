import { Files } from "./Files";

const toString = (
  val: any,
  options?: FormatOptions
): string | null | undefined => {
  const opts = { ...defaultOptions, ...options };
  const { nullsToEmpty } = opts;
  return val === null || val === undefined
    ? nullsToEmpty
      ? ""
      : val
    : String(val);
};

type FormatOptions = {
  alwaysWrap?: boolean;
  nullsToEmpty?: boolean;
};

const defaultOptions: FormatOptions = {
  alwaysWrap: true,
  nullsToEmpty: true,
};

/**
 * Escapes a value for CSV formatting.
 * Wraps in quotes if the value contains commas, newlines, or quotes.
 */
const formatCSVValue = (
  val: any,
  options?: FormatOptions
): string | null | undefined => {
  const opts = { ...defaultOptions, ...options };
  const { alwaysWrap } = opts;
  const stringified = toString(val, opts);
  if (
    alwaysWrap ||
    ((stringified?.length ?? 0) > 0 && /[",\n\r]/.test(stringified!))
  ) {
    // Escape quotes by doubling them and wrap the value in quotes
    return `"${(stringified ?? "").replace(/"/g, '""')}"`;
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
  const csvContent =
    headers.map((header) => formatCSVValue(header)).join(",") + "\n";
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
 * @param options - Formatting options for CSV values.
 */
const appendCsvRows = async ({
  fileUri,
  rows,
  options,
}: {
  fileUri: string;
  rows: any[][];
  options?: FormatOptions;
}) => {
  const csvRows =
    rows
      .map((row) => row.map((val) => formatCSVValue(val, options)).join(","))
      .join("\n") + "\n";
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
