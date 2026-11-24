import { Files } from "utils/Files";

const getDirUri = (subFolder: string) =>
  `${Files.documentDirectory}${subFolder}`;

const makeDirIfNotExists = async (dirUri: string) => {
  const dirInfo = await Files.getInfo(dirUri);
  if (!dirInfo?.exists) {
    await Files.mkDir(dirUri);
  }
};

type FromTo = { from: string; to: string };

const copyFile = async ({ from, to }: FromTo) => Files.copyFile({ from, to });

const moveFile = async ({ from, to }: FromTo) => Files.moveFile({ from, to });

const deleteFile = async (fileUri: string) => Files.del(fileUri, true);

export const GenericFileRepository = {
  getDirUri,
  makeDirIfNotExists,
  copyFile,
  moveFile,
  deleteFile,
};
