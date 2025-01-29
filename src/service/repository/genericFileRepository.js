import { Files } from "utils/Files";

const getDirUri = (subFolder) => `${Files.documentDirectory}${subFolder}`;

const makeDirIfNotExists = async (dirUri) => {
  const dirInfo = await Files.getInfo(dirUri);
  if (!dirInfo.exists) {
    await Files.mkDir(dirUri);
  }
};

const copyFile = async ({ from, to }) => Files.copyFile({ from, to });

const moveFile = async ({ from, to }) => Files.moveFile({ from, to });

const deleteFile = async (fileUri) => Files.del(fileUri);

export const GenericFileRepository = {
  getDirUri,
  makeDirIfNotExists,
  copyFile,
  moveFile,
  deleteFile,
};
