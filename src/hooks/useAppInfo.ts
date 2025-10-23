import { useEffect, useState } from "react";

import { SystemUtils } from "utils";

export const useAppInfo = () => {
  const [state, setState] = useState({});

  useEffect(() => {
    SystemUtils.getApplicationInfo().then((appInfo) => setState(appInfo));
  }, []);

  return state;
};
