import { Buffer } from "buffer";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { File } from "expo-file-system/next";
import mime from "mime";

import { Strings, UUIDs } from "@openforis/arena-core";

import { Environment } from "./Environment";

let { unzip, zip } = Environment.isExpoGo
  ? {}
  : (require("react-native-zip-archive") ?? {});

const PATH_SEPARATOR = "/";
const DOWNLOAD_FOLDER = "Download";
const TEMP_FOLDER_NAME = "am_temp";

const MIME_TYPES = {
  zip: "application/zip ",
};

const defaultChunkSize = 1024 * 1024 * 10; // 10 MB

const { cacheDirectory, documentDirectory, readDirectoryAsync } = FileSystem;

const path = (...parts) =>
  parts.map(Strings.removeSuffix(PATH_SEPARATOR)).join(PATH_SEPARATOR);

const getTempFolderParentUri = () => path(cacheDirectory, TEMP_FOLDER_NAME);

const createTempFolder = async () => {
  const uri = path(getTempFolderParentUri(), UUIDs.v4());
  await mkDir(uri);
  return uri;
};

const mkDir = async (dir) =>
  FileSystem.makeDirectoryAsync(dir, {
    intermediates: true,
  });

const listDir = async (dirUri) => {
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
}) => {
  const stack = [dirUri];
  while (stack.length > 0) {
    const currentDirUri = stack.pop();
    const fileUris = await listDir(currentDirUri);
    for await (const fileUri of fileUris) {
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

const getInfo = async (fileUri, ignoreErrors = true) => {
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

const getAssetInfo = async (assetId) => MediaLibrary.getAssetInfoAsync(assetId);

const getSize = async (fileUri, ignoreErrors = true) => {
  const info = await getInfo(fileUri, ignoreErrors);
  return info?.size ?? 0;
};

const getSizeBase64 = async (fileUri, ignoreErrors = true) => {
  try {
    let size = 0; // result
    let lastContentSize = 0;
    let chunk = 1;
    while (chunk === 1 || lastContentSize > 0) {
      const chunkContent = await readChunk(fileUri, chunk);
      lastContentSize = Buffer.from(
        chunkContent,
        FileSystem.EncodingType.Base64
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

const getDirSize = async (dirUri) => {
  let total = 0;
  await visitDirFilesRecursively({
    dirUri,
    visitor: async (fileUri) => {
      const size = await getSize(fileUri);
      total += size;
    },
  });
  return total;
};

const exists = async (fileUri) => {
  const info = await getInfo(fileUri);
  return info?.exists;
};

const getFreeDiskStorage = async () => FileSystem.getFreeDiskStorageAsync();

const jsonToString = (obj) => JSON.stringify(obj, null, 2);

const getNameFromUri = (uri) => uri.substring(uri.lastIndexOf("/") + 1);

const getExtension = (uri) => {
  const indexOfDot = uri.lastIndexOf(".");
  return indexOfDot < 0 || indexOfDot === uri.length
    ? ""
    : uri.substring(indexOfDot + 1).toLocaleLowerCase();
};

const getMimeTypeFromUri = (uri) => {
  const fileName = getNameFromUri(uri);
  return getMimeTypeFromName(fileName);
};

const getMimeTypeFromName = (fileName) => mime.getType(fileName);

const readAsString = async (fileUri) => FileSystem.readAsStringAsync(fileUri);

const readChunk = async (fileUri, chunkNumber, chunkSize = defaultChunkSize) =>
  FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
    position: (chunkNumber - 1) * chunkSize,
    length: chunkSize,
  });

const readAsBytes = async (fileUri) => {
  const fileObj = new File(fileUri);
  const fileHandle = fileObj.open();
  return fileHandle.readBytes(fileHandle.size);
};

const readAsBuffer = async (fileUri) => {
  const bytes = await readAsBytes(fileUri);
  return Buffer.from(bytes);
};

const readJsonFromFile = async ({ fileUri }) => {
  if (await exists(fileUri)) {
    const content = await readAsString(fileUri);
    return JSON.parse(content);
  }
  return null;
};

const listDirectory = async (fileUri) => {
  try {
    return readDirectoryAsync(fileUri);
  } catch (e) {
    // ignore it
    return [];
  }
};

const copyFile = async ({ from, to }) => FileSystem.copyAsync({ from, to });

const moveFile = async ({ from, to }) => FileSystem.moveAsync({ from, to });

const del = async (fileUri, ignoreErrors = false) =>
  FileSystem.deleteAsync(fileUri, { idempotent: ignoreErrors });

const download = async (uri, targetUri, options) =>
  FileSystem.downloadAsync(uri, targetUri, options);

const moveFileToDownloadFolder = async (fileUri) => {
  const permissionsResponse = await MediaLibrary.requestPermissionsAsync(true);
  if (!permissionsResponse.granted) {
    return false;
  }

  const asset = await MediaLibrary.createAssetAsync(fileUri);
  const album = await MediaLibrary.getAlbumAsync(DOWNLOAD_FOLDER);
  if (album == null) {
    await MediaLibrary.createAlbumAsync(DOWNLOAD_FOLDER, asset, false);
  } else {
    await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
  }
  return true;
};

const writeStringToFile = async ({ content, fileUri }) =>
  FileSystem.writeAsStringAsync(fileUri, content);

const writeJsonToFile = async ({ content, fileUri }) =>
  writeStringToFile({ content: jsonToString(content), fileUri });

const isSharingAvailable = async () => Sharing.isAvailableAsync();

const shareFile = async ({
  url,
  mimeType: mimeTypeParam = null,
  dialogTitle,
}) => {
  const mimeType = mimeTypeParam ?? getMimeTypeFromUri(url);
  await Sharing.shareAsync(url, { mimeType, dialogTitle });
};

const fileSizeUnits = ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

const toHumanReadableFileSize = (bytes, { decimalPlaces = 1 } = {}) => {
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

const copyUriToTempFile = async ({ uri, defaultExtension = "tmp" }) => {
  const fileName = getNameFromUri(uri);
  const tempFolderUri = getTempFolderParentUri();
  const fileNameWithExtension = `${fileName}.${defaultExtension}`;
  const tempFileUri = Files.path(tempFolderUri, fileNameWithExtension);
  await copyFile({ from: uri, to: tempFileUri });
  return tempFileUri;
};

export const Files = {
  MIME_TYPES,
  cacheDirectory,
  documentDirectory,
  path,
  getTempFolderParentUri,
  createTempFolder,
  copyUriToTempFile,
  mkDir,
  del,
  visitDirFilesRecursively,
  getAssetInfo,
  getDirSize,
  getFreeDiskStorage,
  getInfo,
  exists,
  getMimeTypeFromName,
  getMimeTypeFromUri,
  getNameFromUri,
  getExtension,
  getSize,
  getSizeBase64,
  readAsString,
  readChunk,
  readAsBuffer,
  readAsBytes,
  readJsonFromFile,
  listDirectory,
  isSharingAvailable,
  shareFile,
  copyFile,
  moveFile,
  moveFileToDownloadFolder,
  download,
  writeJsonToFile,
  writeStringToFile,
  toHumanReadableFileSize,
  unzip,
  zip,
};
