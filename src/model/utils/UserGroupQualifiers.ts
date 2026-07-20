import {
  NodeDef,
  NodeDefCode,
  NodeDefs,
  NodeDefType,
  NodeValues,
  Survey,
  Surveys,
  UserGroup,
} from "@openforis/arena-core";

const getQualifierValueByNodeDefUuid = ({
  survey,
  userGroup,
}: {
  survey: Survey;
  userGroup: UserGroup | null | undefined;
}): Record<string, string> => {
  const qualifiers = userGroup?.props.qualifiers;
  if (!qualifiers || qualifiers.length === 0) return {};

  const qualifierDefs = Surveys.getQualifierDefs({ survey });
  if (qualifierDefs.length === 0) return {};

  const valueByNodeDefUuid: Record<string, string> = {};
  for (const qualifierDef of qualifierDefs) {
    const qualifierName = NodeDefs.getName(qualifierDef);
    const qualifier = qualifiers.find(
      (candidate) => candidate.name === qualifierName,
    );
    if (qualifier) {
      valueByNodeDefUuid[qualifierDef.uuid] = qualifier.value;
    }
  }
  return valueByNodeDefUuid;
};

const resolveQualifierNodeValue = ({
  survey,
  nodeDef,
  qualifierValue,
}: {
  survey: Survey;
  nodeDef: NodeDef<any>;
  qualifierValue: string;
}): any => {
  if (nodeDef.type === NodeDefType.code) {
    const categoryUuid = NodeDefs.getCategoryUuid(nodeDef as NodeDefCode);
    if (!categoryUuid) return undefined;
    const itemUuid = Surveys.getCategoryItemUuidByCode({
      survey,
      categoryUuid,
      parentItemUuid: undefined,
      code: qualifierValue,
    });
    if (!itemUuid) return undefined;
    return NodeValues.newCodeValue({ itemUuid });
  }
  return qualifierValue;
};

export const UserGroupQualifiers = {
  getQualifierValueByNodeDefUuid,
  resolveQualifierNodeValue,
};
