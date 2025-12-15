import { format, writeToString } from "@fast-csv/format";
import { Files } from "./Files";

const writeCsvHeaders = async ({
  fileUri,
  headers,
}: {
  fileUri: string;
  headers: string[];
}) => {
  const headerRowString = await writeToString([headers], { headers: true });
  await Files.writeStringToFile({
    content: headerRowString,
    fileUri,
    encoding: Files.EncodingType.UTF8,
  });
};

const appendCsvRows = async ({
  fileUri,
  rows,
}: {
  fileUri: string;
  rows: any[];
}) => {
  const content = await writeToString(rows, { headers: false });

  await Files.appendStringToFile({
    content,
    fileUri,
    encoding: Files.EncodingType.UTF8,
  });
};

export const FlatDataWriter = {
  writeCsvHeaders,
  appendCsvRows,
};
