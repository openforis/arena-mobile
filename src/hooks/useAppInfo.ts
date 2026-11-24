import { useEffect, useState } from "react";

import { SystemUtils } from "utils";
import { ArenaMobileAppInfo } from "utils/SystemUtils";

export const useAppInfo = () => {
  // empty until the info is fetched
  const [state, setState] = useState<Partial<ArenaMobileAppInfo>>({});

  useEffect(() => {
    void SystemUtils.getApplicationInfo().then((appInfo) => setState(appInfo));
  }, []);

  return state;
};
