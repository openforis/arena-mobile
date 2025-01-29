import * as ImagePicker from "expo-image-picker";

import { useRequestPermission } from "./useRequestPermission";

export const useRequestMediaLibraryPermission = () => {
  return useRequestPermission(ImagePicker.requestMediaLibraryPermissionsAsync);
};
