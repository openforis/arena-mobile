import { useCallback } from "react";

import { useToast } from "hooks";
import { useTranslation } from "localization";
import { useConfirm } from "state/confirm";
import { Permissions, SystemUtils } from "utils";

enum MediaLibraryPermission {
  accessMediaLocation = "accessMediaLocation",
  imagePickerMediaLibrary = "imagePickerMediaLibrary",
}

const requestFunctionByPermission = {
  [MediaLibraryPermission.imagePickerMediaLibrary]: async () =>
    Permissions.requestImagePickerMediaLibraryPermissions(),
  [MediaLibraryPermission.accessMediaLocation]: async () =>
    Permissions.requestAccessMediaLocation(),
};

const checkCanAccessMediaLibrary = async ({
  toaster,
  t,
  geotagInfoShown,
}: any) => {
  const onPermissionRequestError = ({ permission, error }: any) => {
    toaster("permissions:errorRequestingPermission", {
      permission,
      details: String(error),
    });
  };

  const permissionsToTry = [MediaLibraryPermission.imagePickerMediaLibrary];
  if (geotagInfoShown) {
    permissionsToTry.push(MediaLibraryPermission.accessMediaLocation);
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
    async ({ geotagInfoShown }: any) => {
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
