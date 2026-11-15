import { useCallback, useEffect, useState } from "react";
import type { PermissionResponse } from "expo";

import { log } from "utils/Logger";

export const useRequestPermission = <P extends unknown[]>(
  requestFunction: (...parameters: P) => Promise<PermissionResponse>,
  getterFunction: (() => Promise<PermissionResponse>) | null = null,
) => {
  // null until the permission is checked or requested
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    if (getterFunction) {
      getterFunction()
        .then((result) => {
          setHasPermission(result.granted);
        })
        .catch((error) => {
          log.error(`error checking permission: ${error}`);
        });
    }
  }, [getterFunction]);

  const request = useCallback(
    async (...parameters: P): Promise<boolean> => {
      if (hasPermission) return true;

      const { granted } = await requestFunction(...parameters);

      setHasPermission(granted);
      return granted;
    },
    [hasPermission, requestFunction],
  );

  return { hasPermission, request };
};
