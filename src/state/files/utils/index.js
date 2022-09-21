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

const createFile = async node => {
  try {
    const fileUuid = node?.value?.fileUuid || uuidv4();

    const destinationPath = `${getfilePath({
      surveyUuid: node.surveyUuid,
      cycle: '0', // TODO when cycle
      recordUuid: node.recordUuid,
      nodeUuid: node.uuid,
      fileUuid,
    })}/${node?.value?.fileName}`;

    await fs.copyFile({
      sourcePath: node.value.uri.replace('%20', ' '),
      destinationPath,
    });

    return {
      uuid: fileUuid,
      uri: destinationPath,
      surveyUuid: node.surveyUuid,
      recordUuid: node.recordUuid,
      nodeUuid: node.uuid,
      meta: Object.assign({}, node.value, {fileUuid}),
    };
  } catch (e) {
    console.log('error creating', e);
    return false;
  }
};

// TODO pass node and check surveyUuid and cycle
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

    await fs.deleteDir(dir);
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
    filePath: file.uri.replace('%20', ' '),
    encoding: 'base64',
  });
  return fileContent;
};

const getFilesContent = async files =>
  files.forEach(async file => getFileContent(file));

export default {
  createFile,
  deleteFile,
  deleteFiles,
  getSurveyFiles,
  getFileContent,
  getFilesContent,
};
