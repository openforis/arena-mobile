// @ts-expect-error TS(2307): Cannot find module 'utils/Files' or its correspond... Remove this comment to see the full error message
import { Files } from "utils/Files";

const getDirUri = (subFolder: any) => `${Files.documentDirectory}${subFolder}`;

const makeDirIfNotExists = async (dirUri: any) => {
  const dirInfo = await Files.getInfo(dirUri);
  if (!dirInfo.exists) {
    await Files.mkDir(dirUri);
  }
};

const copyFile = async ({
  from,
  to
}: any) => Files.copyFile({ from, to });

const moveFile = async ({
  from,
  to
}: any) => Files.moveFile({ from, to });

const deleteFile = async (fileUri: any) => Files.del(fileUri);

export const GenericFileRepository = {
  getDirUri,
  makeDirIfNotExists,
  copyFile,
  moveFile,
  deleteFile,
};
