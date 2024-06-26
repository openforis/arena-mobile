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
  data = {directories: [], files: []},
) => {
  const filesAndDirsRead = await readDir({dirPath: pathOfDirToScan});
  if (!filesAndDirsRead) return data;

  await Promise.all(
    filesAndDirsRead.map(async eachItem => {
      const itemPath = pathOfDirToScan + '/' + eachItem.name;
      if (eachItem.isDirectory()) {
        data.directories.push(itemPath);
        data = await scanDir(itemPath, data);
      } else {
        data.files.push(itemPath);
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
  try {
    await RNFetchBlob.fs.mkdir(cleanPathWithBase(dirPath), options);
  } catch (e) {
    console.log(e);
  }
  return true;
};

export const writeFile = async ({filePath, content, encoding}) =>
  RNFetchBlob.fs.writeFile(
    cleanPathWithBase(filePath),
    content,
    encoding || DEFAULT_ENCODING,
  );

export const appendFile = async ({filePath, content, encoding}) =>
  RNFetchBlob.fs.appendFile(
    cleanPathWithBase(filePath),
    content,
    encoding || DEFAULT_ENCODING,
  );

const getPathOfFile = filePath =>
  filePath.substring(0, filePath.lastIndexOf('/'));

export const dirExists = async (path, where) => {
  return RNFetchBlob.fs.exists(cleanPathWithBase(path));
};

export const copyFile = async ({sourcePath, destinationPath}) => {
  const exists = await dirExists(destinationPath);
  if (exists) {
    await deleteDir(getPathOfFile(destinationPath));
  }
  await mkdir({dirPath: getPathOfFile(destinationPath)});
  return RNFS.copyFile(sourcePath, cleanPathWithBase(destinationPath));
};

export const readfile = async ({filePath, encoding}) => {
  const path = cleanPathWithBase(filePath);
  const exists = await dirExists(path);

  if (!exists) {
    return;
  }
  return RNFetchBlob.fs.readFile(path, encoding || DEFAULT_ENCODING);
};

export const copyFileInStream = async ({
  sourcePath,
  destinationPath,
  encoding = DEFAULT_ENCODING,
}) => {
  try {
    const writeStream = await RNFetchBlob.fs.writeStream(
      destinationPath,
      encoding,
    );
    const readStream = await RNFetchBlob.fs.readStream(sourcePath, encoding);

    return new Promise((resolve, reject) => {
      readStream.open();

      readStream.onData(chunk => {
        writeStream.write(chunk);
      });
      readStream.onEnd(() => {
        console.log('close');
        writeStream.close();
        resolve();
      });

      readStream.onError(err => {
        console.log(err);
        reject(err);
      });
    });
  } catch (e) {
    console.log('error', e);
    return false;
  }
};

export const readDir = async ({dirPath}) => {
  const _path = cleanPathWithBase(dirPath);
  const exists = await dirExists(_path);
  if (!exists) {
    return;
  }
  return RNFS.readDir(_path);
};

export const deleteDir = async path => {
  const _path = cleanPathWithBase(path);
  const exists = await dirExists(path);
  if (!exists) {
    return;
  }
  try {
    await RNFetchBlob.fs.unlink(_path);
    return true;
  } catch (e) {
    console.log('deleteDir:unlink', _path, e);
  }
};

export const uploadFiles = async ({
  uploadUrl,
  files,
  onStart,
  onProgress,
  conflictResolutionStrategy,
}) => {
  const _files = files.map(file => ({
    ...file,
    type: file.filetype,
    uri: 'file:///' + file.filepath,
  }));

  const file = {
    uri: _files[0].uri,
    name: _files[0].name,
    type: _files[0].type,
  };

  return API({}).postFile(
    uploadUrl,
    file,
    progress => {
      onProgress({
        totalBytesSent: progress.loaded,
        totalBytesExpectedToSend: progress.total,
      });
    },
    conflictResolutionStrategy,
  );
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
