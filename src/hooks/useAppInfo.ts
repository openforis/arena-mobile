import { useEffect, useState } from "react";

// @ts-expect-error TS(2307): Cannot find module 'utils' or its corresponding ty... Remove this comment to see the full error message
import { SystemUtils } from "utils";

export const useAppInfo = () => {
  const [state, setState] = useState({});

  useEffect(() => {
    SystemUtils.getApplicationInfo().then((appInfo: any) => setState(appInfo));
  }, []);

  return state;
};
