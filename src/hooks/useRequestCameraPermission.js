import { Camera } from "expo-camera";

import { useRequestPermission } from "./useRequestPermission";

export const useRequestCameraPermission = () => {
  return useRequestPermission(Camera.requestCameraPermissionsAsync);
};
