import * as ImagePicker from "expo-image-picker";

import { useRequestPermission } from "./useRequestPermission";

export const useRequestImagePickerMediaLibraryPermission = () =>
  useRequestPermission(ImagePicker.requestMediaLibraryPermissionsAsync);
