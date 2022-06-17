import RNFS from 'react-native-fs';

export const BASE_PATH = RNFS.DocumentDirectoryPath;

const DEFAULT_ENCODING = 'utf8';

export const mkdir = async (
  {dirPath, options} = {
    options: {NSURLIsExcludedFromBackupKey: true},
  },
) => RNFS.mkdir(`${BASE_PATH}/${dirPath}`, options);

export const writeFile = async (
  {filePath, content, encoding} = {
    encoding: DEFAULT_ENCODING,
  },
) => RNFS.writeFile(`${BASE_PATH}/${filePath}`, content, encoding);

export const readfile = async (
  {filePath, encoding} = {
    encoding: DEFAULT_ENCODING,
  },
) => RNFS.readFile(`${BASE_PATH}/${filePath}`, encoding);

export const readDir = async ({dirPath}) =>
  RNFS.readDir(`${BASE_PATH}/${dirPath}`);
export const deleteDir = async path => RNFS.unlink(`${BASE_PATH}/${path}`);

export const uploadFiles = async ({uploadUrl, files, onStart, onProgress}) =>
  RNFS.uploadFiles({
    toUrl: uploadUrl,
    files,
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    begin: onStart,
    progress: onProgress,
  }).promise;
