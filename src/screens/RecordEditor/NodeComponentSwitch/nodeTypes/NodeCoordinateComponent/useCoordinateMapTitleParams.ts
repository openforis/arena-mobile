import { useMemo } from "react";

import { ArenaNodeDef, NodeDefs } from "@openforis/arena-core";

import { SurveySelectors } from "state";

export const useCoordinateMapTitleParams = (nodeDef: ArenaNodeDef<any>) => {
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  return useMemo(
    () => ({ attributeLabel: NodeDefs.getLabelOrName(nodeDef, lang) }),
    [lang, nodeDef],
  );
};
