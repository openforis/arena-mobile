import { useMemo } from "react";

import { NodeDef, NodeDefs } from "@openforis/arena-core";

import { UserGroupQualifiers } from "model";
import { SurveySelectors } from "state";

export const useQualifierAttributeLocked = ({
  nodeDef,
}: {
  nodeDef: NodeDef<any>;
}): boolean => {
  const survey = SurveySelectors.useCurrentSurvey();
  const userGroup = SurveySelectors.useCurrentSurveyUserGroup();

  return useMemo(() => {
    if (!NodeDefs.isQualifier(nodeDef) || !survey) return false;
    const qualifierValueByNodeDefUuid =
      UserGroupQualifiers.getQualifierValueByNodeDefUuid({
        survey,
        userGroup,
      });
    return qualifierValueByNodeDefUuid[nodeDef.uuid] !== undefined;
  }, [nodeDef, survey, userGroup]);
};
