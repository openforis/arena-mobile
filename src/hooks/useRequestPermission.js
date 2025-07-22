import { useCallback, useEffect, useState } from "react";

const permissionGranted = "granted";

export const useRequestPermission = (
  requestFunction,
  getterFunction = null
) => {
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    if (getterFunction) {
      getterFunction().then((result) => {
        setHasPermission(result.granted === permissionGranted);
      });
    }
  }, [getterFunction]);

  const request = useCallback(async () => {
    if (hasPermission) return true;

    const { status } = await requestFunction();
    const granted = status === permissionGranted;

    setHasPermission(granted);
    return granted;
  }, [hasPermission, requestFunction]);

  return { hasPermission, request };
};
