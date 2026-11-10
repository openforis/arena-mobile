import { useEffect, useRef, useState } from "react";

import { useToast } from "hooks";

type Load<T> = (key: string) => Promise<T | null | undefined>;

// loads the keys not requested yet (null when not available); the keys of a failed load can be requested again
export const loadNotRequestedValues = async <T>({
  keys,
  requestedKeys,
  load,
}: {
  keys: string[];
  requestedKeys: Set<string>;
  load: Load<T>;
}): Promise<Record<string, T | null>> => {
  const keysToLoad = keys.filter((key) => !requestedKeys.has(key));
  keysToLoad.forEach((key) => requestedKeys.add(key));
  try {
    const values = await Promise.all(keysToLoad.map(load));
    return Object.fromEntries(
      keysToLoad.map((key, index) => [key, values[index] ?? null]),
    );
  } catch (error) {
    keysToLoad.forEach((key) => requestedKeys.delete(key));
    throw error;
  }
};

// values loaded only when their key is first requested (e.g. when a layer is shown), once
export const useLazyLoadedByKey = <T>({
  keys,
  load,
  onNotAvailable,
}: {
  keys: string[];
  load: Load<T>;
  onNotAvailable: (keys: string[]) => void;
}): Record<string, T | null> => {
  const toaster = useToast();
  const [valueByKey, setValueByKey] = useState<Record<string, T | null>>({});
  const requestedKeysRef = useRef(new Set<string>());

  useEffect(() => {
    loadNotRequestedValues({
      keys,
      requestedKeys: requestedKeysRef.current,
      load,
    })
      .then((valueByKeyLoaded) => {
        const keysLoaded = Object.keys(valueByKeyLoaded);
        if (keysLoaded.length === 0) return;
        setValueByKey((valueByKeyPrev) => ({
          ...valueByKeyPrev,
          ...valueByKeyLoaded,
        }));
        const keysNotAvailable = keysLoaded.filter(
          (key) => !valueByKeyLoaded[key],
        );
        if (keysNotAvailable.length > 0) onNotAvailable(keysNotAvailable);
      })
      .catch((error) => {
        toaster("recordsMap:errorLoadingData", { details: String(error) });
      });
  }, [keys, load, onNotAvailable, toaster]);

  return valueByKey;
};
