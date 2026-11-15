import { useCallback, useEffect } from "react";

import { useNavigationFocus } from "./useNavigationFocus";

// fetches on mount (tabs are mounted when the screen is already focused), resets and fetches again on focus
export const useFocusLoad = ({
  fetch,
  reset,
}: {
  fetch: () => Promise<unknown>;
  reset: () => void;
}): (() => Promise<void>) => {
  const load = useCallback(async () => {
    reset();
    await fetch();
  }, [fetch, reset]);

  useEffect(() => {
    void fetch();
  }, [fetch]);
  useNavigationFocus(load);

  return load;
};
