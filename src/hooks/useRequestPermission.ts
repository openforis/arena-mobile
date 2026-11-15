import { useCallback, useEffect, useState } from "react";

const permissionGranted = "granted";

export const useRequestPermission = (
  requestFunction: any,
  getterFunction = null as any,
) => {
  const [hasPermission, setHasPermission] = useState(null as any);

  useEffect(() => {
    if (getterFunction) {
      getterFunction().then((result: any) => {
        setHasPermission(result.granted);
      });
    }
  }, [getterFunction]);

  const request = useCallback(
    async (...parameters: any[]) => {
      if (hasPermission) return true;

      const { status } = await requestFunction(...parameters);
      const granted = status === permissionGranted;

      setHasPermission(granted);
      return granted;
    },
    [hasPermission, requestFunction],
  );

  return { hasPermission, request };
};
