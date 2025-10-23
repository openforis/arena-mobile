import { useCallback, useEffect, useState } from "react";

const permissionGranted = "granted";

export const useRequestPermission = (
  requestFunction: any,
  getterFunction = null
) => {
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    if (getterFunction) {
      // @ts-expect-error TS(2349): This expression is not callable.
      getterFunction().then((result: any) => {
        // @ts-expect-error TS(2345): Argument of type 'boolean' is not assignable to pa... Remove this comment to see the full error message
        setHasPermission(result.granted === permissionGranted);
      });
    }
  }, [getterFunction]);

  const request = useCallback(
    async (...parameters: any[]) => {
      if (hasPermission) return true;

      const { status } = await requestFunction(...parameters);
      const granted = status === permissionGranted;

      // @ts-expect-error TS(2345): Argument of type 'boolean' is not assignable to pa... Remove this comment to see the full error message
      setHasPermission(granted);
      return granted;
    },
    [hasPermission, requestFunction]
  );

  return { hasPermission, request };
};
