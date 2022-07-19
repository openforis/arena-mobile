import * as fs from 'infra/fs';
import {uuidv4} from 'infra/uuid';

const BASE_ARENA_FILES_PATH = `${fs.BASE_PATH}/arena-files`;

const createFile = async node => {
  const fileUuid = node?.value?.fileUuid || uuidv4();
  const destinationPath = `${BASE_ARENA_FILES_PATH}/${fileUuid}/${node?.value?.fileName}`;

  await fs.copyFile({
    sourcePath: node.value.uri.replace('%20', ' '),
    destinationPath,
  });

  return {
    uuid: fileUuid,
    uri: destinationPath,
    recordUuid: node.recordUuid,
    surveyUuid: node.surveyUuid,
    nodeUuid: node.uuid,
    meta: Object.assign({}, node.value, {fileUuid}),
  };
};

const deleteFile = async fileUuid => {
  if (fileUuid) {
    return fs.deleteDir(`${BASE_ARENA_FILES_PATH}/${fileUuid}`);
  }
  return;
};

const deleteFiles = async filesUuids =>
  Promise.all(filesUuids.map(async fileUuid => deleteFile(fileUuid)));

const readArenaFilesDir = async () => {
  let fileNames = [];
  const fileUuids = await fs.readDir({
    dirPath: BASE_ARENA_FILES_PATH,
  });

  fileUuids.forEach(async _dir => {
    const dir = await fs.readDir({
      dirPath: _dir.path,
    });
    fileNames.push(dir.name);
  });
};

const deleteArenaFilesDir = async () => fs.deleteDir(BASE_ARENA_FILES_PATH);

const getFileContent = async file => {
  const fileContent = await fs.readfile({
    filePath: file.uri.replace('%20', ' '),
    encoding: 'base64',
  });
  console.log('fileContent', fileContent.substring(0, 30));
  return fileContent;
};

const getFilesContent = async files =>
  files.forEach(async file => getFileContent(file));

export default {
  createFile,
  deleteFile,
  deleteFiles,
  deleteArenaFilesDir,
  getFileContent,
  getFilesContent,
  readArenaFilesDir,
};
