import Papa from "papaparse";
import { Files } from "./Files";

const writeCsvHeaders = async ({
  fileUri,
  headers,
}: {
  fileUri: string;
  headers: string[];
}) => {
  const headerRowString = Papa.unparse({
    fields: headers,
    data: [], // No data rows, just the header
  });
  await Files.writeStringToFile({
    content: headerRowString,
    fileUri,
    encoding: Files.EncodingType.UTF8,
  });
};

const appendCsvRows = async ({
  fileUri,
  headers,
  rows,
}: {
  fileUri: string;
  headers: string[];
  rows: any[];
}) => {
  const rowString = Papa.unparse(
    {
      fields: headers, // Pass headers to ensure column order is respected, even if not printing them
      data: rows,
    },
    {
      header: false, // Do not print headers again
    }
  );
  await Files.appendStringToFile({
    content: rowString,
    fileUri,
    encoding: Files.EncodingType.UTF8,
  });
};

export const FlatDataWriter = {
  writeCsvHeaders,
  appendCsvRows,
};
