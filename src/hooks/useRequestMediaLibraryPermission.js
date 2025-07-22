import * as MediaLibrary from "expo-media-library";

import { useRequestPermission } from "./useRequestPermission";

export const useRequestMediaLibraryPermission = () => {
  return useRequestPermission(
    MediaLibrary.requestPermissionsAsync,
    MediaLibrary.getPermissionsAsync
  );
};
