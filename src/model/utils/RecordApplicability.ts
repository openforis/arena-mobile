import {
  ArenaRecord,
  ArenaRecordNode,
  ArenaNodeDef,
  ArenaNodeDefEntity,
  NodeDefs,
  NodeDefType,
  RecordNodes,
  Objects,
  Records,
  ArenaSurvey,
} from "@openforis/arena-core";

import { SurveyDefs } from "./SurveyDefs";

const getApplicableChildrenEntityDefs = ({
  survey,
  nodeDef,
  parentEntity,
  cycle,
  onlyInOwnPage = false,
}: {
  survey: ArenaSurvey;
  nodeDef: ArenaNodeDefEntity;
  parentEntity: ArenaRecordNode;
  cycle: string | undefined;
  onlyInOwnPage?: boolean;
}): ArenaNodeDefEntity[] =>
  SurveyDefs.getChildrenDefs({ survey, nodeDef, cycle: cycle! }).filter(
    (childDef) =>
      NodeDefs.isEntity(childDef) &&
      RecordNodes.isChildApplicable(parentEntity, childDef.uuid) &&
      RecordNodes.isChildVisible(parentEntity, childDef.uuid) &&
      (!onlyInOwnPage ||
        NodeDefs.isDisplayInOwnPage(cycle!)(childDef as ArenaNodeDefEntity)),
  ) as ArenaNodeDefEntity[];

const hasDescendantApplicableNodes = ({
  record,
  parentEntity,
  nodeDef,
}: {
  record: ArenaRecord;
  parentEntity: ArenaRecordNode;
  nodeDef: ArenaNodeDef<NodeDefType>;
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
  survey: ArenaSurvey | undefined;
  entityDef: ArenaNodeDefEntity;
  record: ArenaRecord;
  parentEntity: ArenaRecordNode;
  onlyAttributes?: boolean;
}): ArenaNodeDef<NodeDefType>[] => {
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
  survey: ArenaSurvey | undefined;
  entityDef: ArenaNodeDefEntity;
  record: ArenaRecord;
  parentEntity: ArenaRecordNode;
  onlyKeys?: boolean;
  maxSummaryDefs?: number;
}): ArenaNodeDef<NodeDefType>[] => {
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
