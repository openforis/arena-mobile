import RNFS from 'react-native-fs';

export const BASE_PATH = RNFS.DocumentDirectoryPath;

const DEFAULT_ENCODING = 'utf8';

const cleanPathWithBase = (path = '') => {
  if (path.startsWith('file')) {
    return path;
  }

  // BASE_PATH '/var/...' starts with /
  const cleanPath = `${BASE_PATH}/${path
    .replace(`/private${BASE_PATH}/`, '')
    .replace(`private${BASE_PATH}/`, '')
    .replace(`${BASE_PATH}/`, '')
    .replace(`${BASE_PATH}`, '')}`;
  return cleanPath;
};

export const mkdir = async (
  {dirPath, options} = {
    options: {NSURLIsExcludedFromBackupKey: true},
  },
) => RNFS.mkdir(cleanPathWithBase(dirPath), options);

export const writeFile = async (
  {filePath, content, encoding} = {
    encoding: DEFAULT_ENCODING,
  },
) => RNFS.writeFile(cleanPathWithBase(filePath), content, encoding);

const getPathOfFile = filePath =>
  filePath.substring(0, filePath.lastIndexOf('/'));

export const copyFile = async ({sourcePath, destinationPath}) => {
  const exits = await RNFS.exists(
    getPathOfFile(cleanPathWithBase(destinationPath)),
  );
  if (exits) {
    await deleteDir(getPathOfFile(destinationPath));
  }
  await mkdir({dirPath: getPathOfFile(destinationPath)});
  return RNFS.copyFile(sourcePath, cleanPathWithBase(destinationPath));
};

export const readfile = async (
  {filePath, encoding} = {
    encoding: DEFAULT_ENCODING,
  },
) => {
  return RNFS.readFile(
    cleanPathWithBase(filePath),
    encoding || DEFAULT_ENCODING,
  );
};

export const readDir = async ({dirPath}) => {
  const _path = cleanPathWithBase(dirPath);
  return RNFS.readDir(_path);
};

export const deleteDir = async path => {
  const _path = cleanPathWithBase(path);
  const exits = await RNFS.exists(_path);
  if (!exits) {
    return;
  }
  return RNFS.unlink(_path);
};

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

export const downloadFile = async ({
  downloadUrl,
  toFile,
  onProgress,
  onStart,
}) => {
  return RNFS.downloadFile({
    fromUrl: downloadUrl,
    toFile: cleanPathWithBase(toFile),
    progress: onProgress,
    begin: onStart,
  });
};
