import * as ImagePicker from "expo-image-picker";

import { useRequestPermission } from "./useRequestPermission";

export const useRequestImagePickerMediaLibraryPermission = () => {
  return useRequestPermission(ImagePicker.requestMediaLibraryPermissionsAsync);
};
