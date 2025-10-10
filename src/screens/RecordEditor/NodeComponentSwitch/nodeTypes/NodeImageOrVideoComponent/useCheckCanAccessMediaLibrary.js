import { useCallback } from "react";

import {
  useRequestImagePickerMediaLibraryPermission,
  useRequestMediaLibraryPermission,
  useToast,
} from "hooks";
import { useTranslation } from "localization";
import { Permissions, SystemUtils } from "utils";

export const useCheckCanAccessMediaLibrary = () => {
  const { request: requestImagePickerMediaLibraryPermission } =
    useRequestImagePickerMediaLibraryPermission();
  const { request: requestMediaLibraryPermission } =
    useRequestMediaLibraryPermission();
  const { t } = useTranslation();
  const toaster = useToast();

  const onPermissionRequestError = useCallback(
    ({ permission, error }) => {
      toaster("permissions:errorRequestingPermission", {
        permission,
        details: String(error),
      });
    },
    [toaster]
  );

  return useCallback(
    async ({ geotagInfoShown }) => {
      let permission = t("permissions:mediaLibrary");
      try {
        if (!(await requestImagePickerMediaLibraryPermission())) {
          toaster("permissions:permissionDenied", { permission });
          return false;
        }
      } catch (error) {
        onPermissionRequestError({ permission, error });
        return false;
      }

      if (geotagInfoShown) {
        permission = t("permissions:accessMediaLocation");
        try {
          const mediaLocationAccessAllowed =
            await Permissions.requestAccessMediaLocation();

          if (!mediaLocationAccessAllowed) {
            toaster("permissions:permissionDenied", { permission });
            SystemUtils.openAppSettings();
          }
          return mediaLocationAccessAllowed;
        } catch (error) {
          onPermissionRequestError({ permission, error });
          return false;
        }
      }
      return true;
    },
    [
      onPermissionRequestError,
      requestImagePickerMediaLibraryPermission,
      t,
      toaster,
    ]
  );
};
