import {
  ArenaRecord,
  NodeDef,
  NodeDefCode,
  NodeDefs,
  NodeDefType,
  NodesMap,
  NodeValues,
  Promises,
  Records,
  RecordUpdater,
  Survey,
  Surveys,
  User,
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
  if (
    nodeDef.type === NodeDefType.integer ||
    nodeDef.type === NodeDefType.decimal
  ) {
    const numeric = Number(String(qualifierValue).replaceAll(",", "."));
    return Number.isNaN(numeric) ? undefined : numeric;
  }
  return qualifierValue;
};

// sets the qualifier attributes of the record to the values fixed by the user's group
const assignQualifierValues = async ({
  user,
  survey,
  userGroup,
  record,
  nodes = {},
}: {
  user: User;
  survey: Survey;
  userGroup: UserGroup | null | undefined;
  record: ArenaRecord;
  nodes?: NodesMap;
}): Promise<{ record: ArenaRecord; nodes: NodesMap }> => {
  const qualifierDefs = Surveys.getQualifierDefs({ survey });
  if (qualifierDefs.length === 0) {
    return { record, nodes };
  }
  const qualifierValueByNodeDefUuid = getQualifierValueByNodeDefUuid({
    survey,
    userGroup,
  });

  // update qualifier attributes sequentially: each update starts from the previously updated record
  await Promises.each(qualifierDefs, async (qualifierDef) => {
    const qualifierValue = qualifierValueByNodeDefUuid[qualifierDef.uuid];
    if (qualifierValue === undefined) return;
    const value = resolveQualifierNodeValue({
      survey,
      nodeDef: qualifierDef,
      qualifierValue,
    });
    if (value === undefined) return;
    const [qualifierNode] = Records.getNodesByDefUuid(qualifierDef.uuid)(
      record,
    );
    if (!qualifierNode) return;
    const { record: recordUpdated, nodes: nodesUpdated } =
      await RecordUpdater.updateAttributeValue({
        user,
        survey,
        record,
        attributeUuid: qualifierNode.uuid,
        value,
      });
    record = recordUpdated;
    nodes = { ...nodes, ...nodesUpdated };
  });
  return { record, nodes };
};

export const UserGroupQualifiers = {
  getQualifierValueByNodeDefUuid,
  resolveQualifierNodeValue,
  assignQualifierValues,
};
