import { useEffect, useState } from "react";

import { SystemUtils } from "utils";
import { ArenaMobileAppInfo } from "utils/SystemUtils";

export const useAppInfo = () => {
  const [state, setState] = useState({} as ArenaMobileAppInfo);

  useEffect(() => {
    SystemUtils.getApplicationInfo().then((appInfo) => setState(appInfo));
  }, []);

  return state;
};
