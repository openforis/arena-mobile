import { useMemo } from "react";

import { NodeDef, NodeDefs } from "@openforis/arena-core";

import { SurveySelectors } from "state";

export const useCoordinateMapTitleParams = (nodeDef: NodeDef<any>) => {
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  return useMemo(
    () => ({ attributeLabel: NodeDefs.getLabelOrName(nodeDef, lang) }),
    [lang, nodeDef],
  );
};
