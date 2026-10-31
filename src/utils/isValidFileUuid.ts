// stored file names come from imported records: this one can't point to another folder (e.g. "../..")
export const isValidFileUuid = (fileUuid: string): boolean =>
  /^[\w-]+$/.test(fileUuid);
