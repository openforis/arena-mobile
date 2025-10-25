import { UUIDs } from "@openforis/arena-core";

import { Files } from "utils";
import { APIUtils } from "./apiUtils";

const getFile = async ({
  serverUrl,
  uri,
  params,
  callback: _callback,
  targetFileUri = null,
  options = {}
}: any) => {
  const actualTargetFileUri =
    targetFileUri ?? Files.path(Files.cacheDirectory, UUIDs.v4() + ".tmp");
  const url = APIUtils.getUrlWithParams({ serverUrl, uri, params });
  await Files.download(url, actualTargetFileUri, options);
  return actualTargetFileUri;
};

export const APICommon = {
  getFile,
};
