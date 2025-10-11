import { useCallback } from "react";

import { useToast } from "hooks";
import { useTranslation } from "localization";
import { useConfirm } from "state/confirm";
import { Permissions, SystemUtils } from "utils";

const mediaLibraryPermissions = {
  accessMediaLocation: "accessMediaLocation",
  imagePickerMediaLibrary: "imagePickerMediaLibrary",
};

const requestFunctionByPermission = {
  [mediaLibraryPermissions.imagePickerMediaLibrary]: async () =>
    Permissions.requestImagePickerMediaLibraryPermissions(),
  [mediaLibraryPermissions.accessMediaLocation]: async () =>
    Permissions.requestAccessMediaLocation(),
};

const checkCanAccessMediaLibrary = async ({ toaster, t, geotagInfoShown }) => {
  const onPermissionRequestError = ({ permission, error }) => {
    toaster("permissions:errorRequestingPermission", {
      permission,
      details: String(error),
    });
  };

  const permissionsToTry = [mediaLibraryPermissions.imagePickerMediaLibrary];
  if (geotagInfoShown) {
    permissionsToTry.push(mediaLibraryPermissions.accessMediaLocation);
  }
  for (const permission of permissionsToTry) {
    const permissionLabel = t(`permissions:types.${permission}`);
    try {
      const requestPermission = requestFunctionByPermission[permission];
      const granted = await requestPermission();
      if (!granted) {
        toaster("permissions:permissionDenied", {
          permission: permissionLabel,
        });
        return false;
      }
    } catch (error) {
      onPermissionRequestError({ permission, error });
      return false;
    }
  }
  return true;
};

export const useCheckCanAccessMediaLibrary = () => {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const toaster = useToast();

  return useCallback(
    async ({ geotagInfoShown }) => {
      let canAccess = await checkCanAccessMediaLibrary({
        toaster,
        t,
        geotagInfoShown,
      });
      if (!canAccess) {
        // ask to open settings and give permissions
        const confirmMessagePrefix =
          "permissions:confirmOpenSettingsAccessMediaLocationNotAllowed";
        if (
          await confirm({
            messageKey: `${confirmMessagePrefix}.message`,
            titleKey: `${confirmMessagePrefix}.title`,
            confirmButtonTextKey: "common:openSettings",
          })
        ) {
          await SystemUtils.openAppSettings();
          canAccess = await checkCanAccessMediaLibrary({
            toaster,
            t,
            geotagInfoShown,
          });
        }
      }
      return canAccess;
    },
    [confirm, t, toaster]
  );
};
