import {Platform} from 'react-native';

import * as fs from 'infra/fs';
import {uuidv4} from 'infra/uuid';
import {getSurveyFolder} from 'state/__persistence';

const getFilesFolderPath = ({surveyUuid, cycle}) =>
  `${getSurveyFolder(surveyUuid)}/${cycle}/files`;

const getNodePath = ({surveyUuid, cycle, recordUuid, nodeUuid}) =>
  `${getFilesFolderPath({surveyUuid, cycle})}/${recordUuid}/${nodeUuid}`;

const getfilePath = ({surveyUuid, cycle, recordUuid, nodeUuid, fileUuid}) =>
  `${getNodePath({
    surveyUuid,
    cycle,
    recordUuid,
    nodeUuid,
  })}/${fileUuid}`;

const createFile = async ({node, cycle}) => {
  try {
    const fileUuid = node?.value?.fileUuid || uuidv4();

    const destinationPath = `${getfilePath({
      surveyUuid: node.surveyUuid,
      cycle,
      recordUuid: node.recordUuid,
      nodeUuid: node.uuid,
      fileUuid,
    })}/${node?.value?.fileName}`;

    let sourcePath = decodeURI(node.value.uri.replace('%20', ' '));
    sourcePath =
      Platform.OS === 'ios' ? sourcePath.replace('file:', '') : sourcePath;

    const exists = await fs.dirExists(destinationPath);
    const sourceExists = await fs.dirExists(sourcePath);

    if (!sourceExists) {
      throw new Error('File not found', sourcePath);
    }

    if (!exists && sourceExists) {
      await fs.copyFile({sourcePath, destinationPath});
    }

    return {
      uuid: fileUuid,
      uri: destinationPath,
      surveyUuid: node.surveyUuid,
      recordUuid: node.recordUuid,
      nodeUuid: node.uuid,
      meta: {
        ...node.value,
        fileUuid,
        uri: destinationPath,
        path: destinationPath,
      },
    };
  } catch (e) {
    console.log('error creating', e);
    return false;
  }
};

const deleteFile = async ({
  surveyUuid,
  cycle,
  recordUuid,
  nodeUuid,
  fileUuid,
}) => {
  if (fileUuid) {
    const dir = `${getNodePath({
      surveyUuid,
      cycle,
      recordUuid,
      nodeUuid,
    })}`;

    try {
      await fs.deleteDir(dir);
    } catch (e) {
      console.log('deleteFile: error deleting file', dir, e);
      return false;
    }
  }
};

const deleteFiles = async files =>
  Promise.all(files.map(async file => deleteFile(file)));

const getSurveyFiles = async ({surveyUuid, cycle}) => {
  const dir = getFilesFolderPath({surveyUuid, cycle});
  return fs.scanDir(dir);
};
const getFileContent = async file => {
  const fileContent = await fs.readfile({
    filePath: file?.uri?.replace('%20', ' '),
    encoding: 'base64',
  });
  return fileContent;
};

const moveFileContent = async ({file, destinationPath, encoding}) => {
  const source = fs.cleanPathWithBase(file?.uri.replace('%20', ' '));
  const destination = destinationPath.replace('%20', ' ');

  const exists = await fs.dirExists(source);
  if (!exists) {
    return;
  }

  await fs.copyFileInStream({
    sourcePath: source,
    destinationPath: destination,
    encoding,
  });

  console.log('Finish');

  return;
};

export default {
  createFile,
  deleteFile,
  deleteFiles,
  getSurveyFiles,
  getFileContent,
  moveFileContent,
};
