import axios from 'axios';
import {Platform} from 'react-native';
import RNFetchBlob from 'react-native-blob-util';
import RNFS from 'react-native-fs';

import API from 'infra/api';

export const BASE_PATH = RNFS.DocumentDirectoryPath;
export const BASE_PATH_DATA = `${BASE_PATH}/arena-data`;
export const TMP_BASE_PATH = (RNFS.TemporaryDirectoryPath || '')
  .replace(/\/$/, '')
  .replace(/^\/private\//, '');

const DEFAULT_ENCODING = 'utf8';

const clean = (path, sourcePath) => {
  return `${sourcePath}/${path
    .replace(`/private/${sourcePath}/`, '')
    .replace(`private/${sourcePath}/`, '')
    .replace(`${sourcePath}/`, '')
    .replace(sourcePath, '')}`;
};

export const cleanPathWithBase = (path = '') => {
  if (path.startsWith('file')) {
    return path;
  }
  // BASE_PATH '/var/...' starts with /
  let cleanPath = path;
  if (path.includes(TMP_BASE_PATH)) {
    cleanPath = clean(path, TMP_BASE_PATH);
  }
  if (path.includes(BASE_PATH)) {
    cleanPath = clean(path, BASE_PATH);
  }

  cleanPath = cleanPath
    .substring(cleanPath.indexOf('/Documents'))
    .replace('/Documents', BASE_PATH);

  return cleanPath;
};

export const scanDir = async (
  pathOfDirToScan,
  data = {directory: [], files: []},
) => {
  const readedFilesAndDir = await readDir({dirPath: pathOfDirToScan});

  await Promise.all(
    readedFilesAndDir.map(async eachItem => {
      if (eachItem.isDirectory()) {
        const directoryPath = pathOfDirToScan + '/' + eachItem.name;
        data.directory.push(directoryPath);
        data = await scanDir(directoryPath, data);
      } else {
        data.files.push(pathOfDirToScan + '/' + eachItem.name);
      }
    }),
  );

  return data;
};

export const mkdir = async (
  {dirPath, options} = {
    options: {NSURLIsExcludedFromBackupKey: true},
  },
) => {
  const exists = await dirExists(dirPath);
  if (exists) {
    return true;
  }
  return RNFS.mkdir(cleanPathWithBase(dirPath), options);
};

export const writeFile = async ({filePath, content, encoding}) =>
  RNFS.writeFile(
    cleanPathWithBase(filePath),
    content,
    encoding || DEFAULT_ENCODING,
  );

export const appendFile = async ({filePath, content, encoding}) =>
  RNFS.appendFile(
    cleanPathWithBase(filePath),
    content,
    encoding || DEFAULT_ENCODING,
  );

const getPathOfFile = filePath =>
  filePath.substring(0, filePath.lastIndexOf('/'));

export const dirExists = async path => RNFS.exists(cleanPathWithBase(path));

export const copyFile = async ({sourcePath, destinationPath}) => {
  const exits = await dirExists(destinationPath);
  if (exits) {
    await deleteDir(getPathOfFile(destinationPath));
  }
  await mkdir({dirPath: getPathOfFile(destinationPath)});
  return RNFS.copyFile(sourcePath, cleanPathWithBase(destinationPath));
};

export const readfile = async ({filePath, encoding}) => {
  const path = cleanPathWithBase(filePath);
  const exits = await dirExists(path);

  if (!exits) {
    return;
  }
  return RNFS.readFile(path, encoding || DEFAULT_ENCODING);
};

export const readDir = async ({dirPath}) => {
  const _path = cleanPathWithBase(dirPath);
  const exits = await dirExists(_path);
  if (!exits) {
    return;
  }
  return RNFS.readDir(_path);
};

export const deleteDir = async path => {
  const _path = cleanPathWithBase(path);
  const exits = await dirExists(path);
  if (!exits) {
    return;
  }
  return RNFS.unlink(_path);
};

export const uploadFiles = async ({uploadUrl, files, onStart, onProgress}) => {
  const _files = files.map(file =>
    Object.assign({}, file, {
      type: file.filetype,
      uri: 'file:///' + file.filepath,
    }),
  );

  const file = {
    uri: _files[0].uri,
    name: _files[0].name,
    type: _files[0].type,
  };

  return API({}).postFile(uploadUrl, file, progress => {
    console.log('progress', progress);
    onProgress({
      totalBytesSent: progress.loaded,
      totalBytesExpectedToSend: progress.total,
    });
  });
};

const blobToBase64 = data => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(data);
    reader.onloadend = async () => {
      const base64data = reader.result;

      resolve(base64data);
    };
  });
};
export const downloadFile = async ({
  downloadUrl,
  toFile,
  onProgress,
  onStart,
}) => {
  if (Platform.OS === 'android') {
    const res = await axios.get(downloadUrl, {
      responseType: 'blob',
      withCredentials: true,
    });

    const base64data = await blobToBase64(res.data);

    return RNFetchBlob.fs.writeFile(toFile, base64data);
  }

  return RNFS.downloadFile({
    fromUrl: downloadUrl,
    toFile: cleanPathWithBase(toFile),
    progress: onProgress,
    begin: onStart,
  });
};
