import * as MediaLibrary from "expo-media-library";

import { Environment } from "utils/Environment";
import { useRequestPermission } from "./useRequestPermission";

const granularPermissions = ["photo", "video"];

export const useRequestMediaLibraryPermission = () =>
  useRequestPermission(
    async () =>
      Environment.isExpoGo
        ? { status: MediaLibrary.PermissionStatus.GRANTED }
        : MediaLibrary.requestPermissionsAsync(false, granularPermissions),
    MediaLibrary.getPermissionsAsync
  );
