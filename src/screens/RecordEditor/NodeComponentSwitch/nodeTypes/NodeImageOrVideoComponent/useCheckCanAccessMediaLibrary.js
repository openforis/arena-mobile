import { useCallback } from "react";

import { useToast } from "hooks";
import { useTranslation } from "localization";
import { Permissions } from "utils";

const mediaLibraryPermissions = {
  mediaLibrary: "mediaLibrary",
  accessMediaLocation: "accessMediaLocation",
};

const requestFunctionByPermission = {
  [mediaLibraryPermissions.mediaLibrary]: async () =>
    Permissions.requestMediaLibraryPermissions(),
  [mediaLibraryPermissions.accessMediaLocation]: async () =>
    Permissions.requestAccessMediaLocation(),
};

export const useCheckCanAccessMediaLibrary = () => {
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
      const permissionsToTry = [mediaLibraryPermissions.mediaLibrary];
      if (geotagInfoShown) {
        permissionsToTry.push(mediaLibraryPermissions.accessMediaLocation);
      }
      for (const permission of permissionsToTry) {
        const permissionLabel = t(`permissions:${permission}`);
        try {
          const requestFunction = requestFunctionByPermission[permission];
          if (!(await requestFunction())) {
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
    },
    [onPermissionRequestError, t, toaster]
  );
};
