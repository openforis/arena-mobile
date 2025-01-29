import { useCallback, useState } from "react";

export const useRequestPermission = (requestFunction) => {
  const [hasPermission, setHasPermission] = useState(null);

  const request = useCallback(async () => {
    if (hasPermission) return true;

    const { status } = await requestFunction();
    const granted = status === "granted";

    setHasPermission(granted);
    return granted;
  }, [hasPermission, requestFunction]);

  return { hasPermission, request };
};
