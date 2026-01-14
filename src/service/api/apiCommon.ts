import * as FileSystem from "expo-file-system/legacy";

import { UUIDs } from "@openforis/arena-core";

import { Files } from "utils";
import { APIUtils } from "./apiUtils";
import { RequestOptions } from "./apiTypes";

type FileRequestOptions = RequestOptions & {
  targetFileUri?: string;
  config?: FileSystem.DownloadOptions;
};

const getFile = async (options: FileRequestOptions): Promise<string> => {
  const { serverUrl, uri, data, targetFileUri, config } = options;
  const actualTargetFileUri =
    targetFileUri ?? Files.path(Files.cacheDirectory, UUIDs.v4() + ".tmp");
  const url = APIUtils.getUrlWithParams({ serverUrl, uri, data });
  await Files.download(url, actualTargetFileUri, config);
  return actualTargetFileUri;
};

export const APICommon = {
  getFile,
};
