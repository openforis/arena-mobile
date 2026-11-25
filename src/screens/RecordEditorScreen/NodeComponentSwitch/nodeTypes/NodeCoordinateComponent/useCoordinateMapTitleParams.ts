import { useMemo } from "react";

import { ArenaAnyNodeDef, NodeDefs } from "@openforis/arena-core";

import { SurveySelectors } from "state";

export const useCoordinateMapTitleParams = (nodeDef: ArenaAnyNodeDef) => {
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  return useMemo(
    () => ({ attributeLabel: NodeDefs.getLabelOrName(nodeDef, lang) }),
    [lang, nodeDef],
  );
};
