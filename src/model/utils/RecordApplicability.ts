import {
  ArenaRecord,
  ArenaRecordNode,
  NodeDef,
  NodeDefEntity,
  NodeDefs,
  NodeDefType,
  Nodes,
  Objects,
  Records,
  Survey,
} from "@openforis/arena-core";

import { SurveyDefs } from "./SurveyDefs";

const getApplicableChildrenEntityDefs = ({
  survey,
  nodeDef,
  parentEntity,
  cycle,
  onlyInOwnPage = false,
}: {
  survey: Survey;
  nodeDef: NodeDefEntity;
  parentEntity: ArenaRecordNode;
  cycle: string | undefined;
  onlyInOwnPage?: boolean;
}): NodeDefEntity[] =>
  SurveyDefs.getChildrenDefs({ survey, nodeDef, cycle: cycle! }).filter(
    (childDef) =>
      NodeDefs.isEntity(childDef) &&
      Nodes.isChildApplicable(parentEntity, childDef.uuid) &&
      Nodes.isChildVisible(parentEntity, childDef.uuid) &&
      (!onlyInOwnPage ||
        NodeDefs.isDisplayInOwnPage(cycle!)(childDef as NodeDefEntity)),
  ) as NodeDefEntity[];

const hasDescendantApplicableNodes = ({
  record,
  parentEntity,
  nodeDef,
}: {
  record: ArenaRecord;
  parentEntity: ArenaRecordNode;
  nodeDef: NodeDef<NodeDefType>;
}): boolean => {
  const descendants = Records.getDescendantsOrSelf(
    parentEntity,
    nodeDef,
  )(record);
  return descendants.some((node) => Records.isNodeApplicable(node)(record));
};

const getApplicableDescendantDefs = ({
  survey,
  entityDef,
  record,
  parentEntity,
  onlyAttributes = true,
}: {
  survey: Survey | undefined;
  entityDef: NodeDefEntity;
  record: ArenaRecord;
  parentEntity: ArenaRecordNode;
  onlyAttributes?: boolean;
}): NodeDef<NodeDefType>[] => {
  const cycle = record.cycle!;
  const defs = SurveyDefs.getDescendantsInSingleEntities({
    survey: survey!,
    cycle,
    entityDef,
  });
  return defs.filter(
    (nodeDef) =>
      (!onlyAttributes || NodeDefs.isAttribute(nodeDef)) &&
      (Objects.isEmpty(NodeDefs.getApplicable(nodeDef)) ||
        hasDescendantApplicableNodes({ record, parentEntity, nodeDef })),
  );
};

const getApplicableSummaryDefs = ({
  survey,
  entityDef,
  record,
  parentEntity,
  onlyKeys = false,
  maxSummaryDefs = undefined,
}: {
  survey: Survey | undefined;
  entityDef: NodeDefEntity;
  record: ArenaRecord;
  parentEntity: ArenaRecordNode;
  onlyKeys?: boolean;
  maxSummaryDefs?: number;
}): NodeDef<NodeDefType>[] => {
  const cycle = record.cycle!;
  const summaryDefs = SurveyDefs.getEntitySummaryDefs({
    survey: survey!,
    cycle,
    entityDef,
    onlyKeys,
    maxSummaryDefs,
  });
  return summaryDefs.filter(
    (nodeDef) =>
      Objects.isEmpty(NodeDefs.getApplicable(nodeDef)) ||
      hasDescendantApplicableNodes({ record, parentEntity, nodeDef }),
  );
};

export const RecordApplicability = {
  getApplicableChildrenEntityDefs,
  hasDescendantApplicableNodes,
  getApplicableDescendantDefs,
  getApplicableSummaryDefs,
};
