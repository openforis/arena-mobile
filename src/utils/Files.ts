import { Buffer } from "buffer";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { File } from "expo-file-system/next";
import mime from "mime";

import { Objects, Strings, UUIDs } from "@openforis/arena-core";

import { Environment } from "./Environment";

let { unzip, zip }: any = Environment.isExpoGo
  ? {}
  : (require("react-native-zip-archive") ?? {});

const PATH_SEPARATOR = "/";
const TEMP_FOLDER_NAME = "am_temp";

const MIME_TYPES = {
  zip: "application/zip ",
};

const defaultChunkSize = 1024 * 1024 * 10; // 10 MB

const { documentDirectory, readDirectoryAsync } = FileSystem;
const cacheDirectory = FileSystem.cacheDirectory!;

const path = (...parts: (string | null | undefined)[]): string => {
  const result: string[] = [];
  for (const part of parts) {
    if (Objects.isNotEmpty(part)) {
      result.push(Strings.removeSuffix(PATH_SEPARATOR)(part));
    }
  }
  return result.join(PATH_SEPARATOR);
};

const getTempFolderParentUri = (): string =>
  path(cacheDirectory, TEMP_FOLDER_NAME);

const createTempFolder = async (): Promise<string> => {
  const uri = path(getTempFolderParentUri(), UUIDs.v4());
  await mkDir(uri);
  return uri;
};

const mkDir = async (dirUri: string): Promise<void> =>
  FileSystem.makeDirectoryAsync(dirUri, {
    intermediates: true,
  });

const listDir = async (dirUri: string): Promise<string[]> => {
  try {
    const fileNames = await FileSystem.readDirectoryAsync(dirUri);
    return fileNames.map((fileName) => path(dirUri, fileName));
  } catch (error) {
    return [];
  }
};

const visitDirFilesRecursively = async ({
  dirUri,
  visitor,
  visitDirectories = false,
}: {
  dirUri: string;
  visitor: (fileUri: string) => Promise<void>;
  visitDirectories?: boolean;
}): Promise<void> => {
  const stack = [dirUri];
  while (stack.length > 0) {
    const currentDirUri = stack.pop()!;
    const fileUris = await listDir(currentDirUri);
    for (const fileUri of fileUris) {
      const info = await getInfo(fileUri);
      if (info) {
        if (!info.isDirectory || visitDirectories) {
          await visitor(fileUri);
        }
        if (info.isDirectory) {
          stack.push(fileUri);
        }
      }
    }
  }
};

const getInfo = async (
  fileUri: any,
  ignoreErrors = true,
): Promise<FileSystem.FileInfo | null> => {
  try {
    const info = await FileSystem.getInfoAsync(fileUri);
    return info;
  } catch (error) {
    if (ignoreErrors) {
      return null;
    }
    throw error;
  }
};

const getSize = async (fileUri: any, ignoreErrors = true): Promise<number> => {
  const info = await getInfo(fileUri, ignoreErrors);
  return info?.exists ? info.size : 0;
};

const getSizeBase64 = async (
  fileUri: any,
  ignoreErrors = true,
): Promise<number> => {
  try {
    let size = 0; // result
    let lastContentSize = 0;
    let chunk = 1;
    while (chunk === 1 || lastContentSize > 0) {
      const chunkContent = await readChunkAsString(fileUri, chunk);
      lastContentSize = Buffer.from(
        chunkContent,
        FileSystem.EncodingType.Base64,
      ).length;
      size += lastContentSize;
      chunk += 1;
    }
    return size;
  } catch (error) {
    if (ignoreErrors) {
      return 0;
    }
    throw error;
  }
};

const getDirSize = async (dirUri: any): Promise<number> => {
  let total = 0;
  await visitDirFilesRecursively({
    dirUri,
    visitor: async (fileUri: any) => {
      const size = await getSize(fileUri);
      total += size;
    },
  });
  return total;
};

const exists = async (fileUri: any): Promise<boolean> => {
  const info = await getInfo(fileUri, true);
  return info?.exists ?? false;
};

const getFreeDiskStorage = async (): Promise<number> =>
  FileSystem.getFreeDiskStorageAsync();

const jsonToString = (obj: any): string => JSON.stringify(obj, null, 2);

const getNameFromUri = (uri: string): string =>
  uri.substring(uri.lastIndexOf("/") + 1);

const getExtension = (uri: string): string => {
  const indexOfDot = uri.lastIndexOf(".");
  return indexOfDot < 0 || indexOfDot === uri.length
    ? ""
    : uri.substring(indexOfDot + 1).toLocaleLowerCase();
};

const hasExtension = (uri: string): boolean =>
  !!getExtension(getNameFromUri(uri));

const getMimeTypeFromUri = (uri: string): string | null => {
  const fileName = getNameFromUri(uri);
  return getMimeTypeFromName(fileName);
};

const getMimeTypeFromName = (fileName: string): string | null =>
  mime.getType(fileName);

const readAsString = async (
  fileUri: string,
  encoding?: FileSystem.EncodingType,
): Promise<string> =>
  FileSystem.readAsStringAsync(fileUri, encoding ? { encoding } : undefined);

const readChunkAsString = async (
  fileUri: string,
  chunkNumber: number,
  chunkSize = defaultChunkSize,
): Promise<string> =>
  FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
    position: (chunkNumber - 1) * chunkSize,
    length: chunkSize,
  });

const readAsBytes = async (
  fileUri: string,
): Promise<Uint8Array<ArrayBuffer> | null> => {
  const fileObj = new File(fileUri);
  const fileHandle = fileObj.open();
  const fileSize = fileHandle.size;
  return fileSize ? fileHandle.readBytes(fileSize) : null;
};

const readAsBuffer = async (fileUri: any): Promise<Buffer | null> => {
  const bytes = await readAsBytes(fileUri);
  return bytes ? Buffer.from(bytes) : null;
};

const readJsonFromFile = async ({ fileUri }: any): Promise<Object | null> => {
  if (await exists(fileUri)) {
    const content = await readAsString(fileUri);
    return JSON.parse(content);
  }
  return null;
};

const listDirectory = async (fileUri: string | null): Promise<string[]> => {
  if (!fileUri) {
    return [];
  }
  try {
    return readDirectoryAsync(fileUri);
  } catch (e) {
    // ignore it
    return [];
  }
};

const copyFile = async ({
  from,
  to,
}: {
  from: string;
  to: string;
}): Promise<void> => FileSystem.copyAsync({ from, to });

const moveFile = async ({
  from,
  to,
}: {
  from: string;
  to: string;
}): Promise<void> => FileSystem.moveAsync({ from, to });

const del = async (fileUri: string, ignoreErrors = false): Promise<void> =>
  FileSystem.deleteAsync(fileUri, { idempotent: ignoreErrors });

const download = async (
  uri: string,
  targetUri: string,
  options?: FileSystem.DownloadOptions,
): Promise<FileSystem.FileSystemDownloadResult> =>
  FileSystem.downloadAsync(uri, targetUri, options);

const writeStringToFile = async ({
  content,
  fileUri,
  encoding,
}: {
  content: string;
  fileUri: string;
  encoding?: FileSystem.EncodingType;
}): Promise<void> => {
  await createIfNotExists(fileUri);
  return FileSystem.writeAsStringAsync(
    fileUri,
    content,
    encoding ? { encoding } : undefined,
  );
};

const writeJsonToFile = async ({
  content,
  fileUri,
}: {
  content: any;
  fileUri: string;
}): Promise<void> =>
  writeStringToFile({ content: jsonToString(content), fileUri });

const createIfNotExists = async (fileUri: string) => {
  const file = new File(fileUri);
  if (!(await exists(fileUri))) {
    file.create();
  }
  return file;
};

const writeBytesToFile = async ({
  fileUri,
  bytes,
}: {
  fileUri: string;
  bytes: Uint8Array<ArrayBuffer>;
}): Promise<void> => {
  let fileHandle;
  try {
    const file = await createIfNotExists(fileUri);
    fileHandle = file.open();
    fileHandle.writeBytes(bytes);
  } finally {
    fileHandle?.close();
  }
};

const appendStringToFile = async ({
  content,
  fileUri,
  encoding,
}: {
  content: string;
  fileUri: string;
  encoding?: FileSystem.EncodingType;
}): Promise<void> => {
  let finalContent = content;
  if (await exists(fileUri)) {
    const currentContent = await readAsString(fileUri, encoding);
    finalContent = currentContent + content;
  }
  await writeStringToFile({ content: finalContent, fileUri, encoding });
};

const isSharingAvailable = async (): Promise<boolean> =>
  Sharing.isAvailableAsync();

const shareFile = async ({
  url,
  mimeType: mimeTypeParam,
  dialogTitle,
}: {
  url: string;
  mimeType?: string | null;
  dialogTitle?: string;
}): Promise<void> => {
  const mimeType = mimeTypeParam ?? getMimeTypeFromUri(url);
  const options: Sharing.SharingOptions = { dialogTitle };
  if (mimeType) {
    options["mimeType"] = mimeType;
  }
  await Sharing.shareAsync(url, options);
};

const fileSizeUnits = ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

const toHumanReadableFileSize = (
  bytes: any,
  { decimalPlaces = 1 } = {},
): string => {
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

const copyUriToTempFile = async ({
  uri,
  defaultExtension = "tmp",
  tempFileName = UUIDs.v4(),
}: {
  uri: string;
  defaultExtension?: string;
  tempFileName?: string;
}): Promise<string> => {
  const fileName = tempFileName ?? getNameFromUri(uri);
  const tempFolderUri = getTempFolderParentUri();
  const fileNameWithExtension = `${fileName}.${defaultExtension}`;
  const tempFileUri = Files.path(tempFolderUri, fileNameWithExtension);
  await copyFile({ from: uri, to: tempFileUri });
  return tempFileUri;
};

export const Files = {
  MIME_TYPES,
  EncodingType: FileSystem.EncodingType,
  cacheDirectory,
  documentDirectory,
  path,
  getTempFolderParentUri,
  createTempFolder,
  copyUriToTempFile,
  mkDir,
  del,
  visitDirFilesRecursively,
  getDirSize,
  getFreeDiskStorage,
  getInfo,
  exists,
  getMimeTypeFromName,
  getMimeTypeFromUri,
  getNameFromUri,
  getExtension,
  hasExtension,
  getSize,
  getSizeBase64,
  readAsString,
  readChunkAsString,
  readAsBuffer,
  readAsBytes,
  readJsonFromFile,
  listDirectory,
  isSharingAvailable,
  shareFile,
  copyFile,
  moveFile,
  download,
  writeJsonToFile,
  writeStringToFile,
  writeBytesToFile,
  appendStringToFile,
  toHumanReadableFileSize,
  unzip,
  zip,
};
