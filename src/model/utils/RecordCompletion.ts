import {
  ArenaRecord,
  ArenaRecordNode,
  NodeDef,
  NodeDefs,
  NodeDefType,
  Records,
  Survey,
} from "@openforis/arena-core";

export type CompletionStats = { total: number; filled: number };

type ChildEntityCompletionParams = {
  survey: Survey;
  record: ArenaRecord;
  parentEntity: ArenaRecordNode;
  childDef: NodeDef<NodeDefType>;
  childEntity: ArenaRecordNode | null | undefined;
};

const toCompletionPercent = (stats: CompletionStats): number => {
  const { total, filled } = stats;
  if (total <= 0) return 100;
  return Math.round((filled / total) * 100);
};

const getChildEntityCompletionStats = ({
  survey,
  record,
  parentEntity,
  childDef,
  childEntity,
}: ChildEntityCompletionParams): CompletionStats => {
  if (NodeDefs.isSingle(childDef)) {
    return childEntity
      ? Records.getEntityCompletionStats({
          survey,
          record,
          entity: childEntity,
        })
      : { total: 1, filled: 0 };
  }
  const entities = Records.getChildren(parentEntity, childDef.uuid)(record);
  if (entities.length === 0) return { total: 1, filled: 0 };
  return entities.reduce(
    (acc: CompletionStats, entity: ArenaRecordNode) => {
      const stats = Records.getEntityCompletionStats({
        survey,
        record,
        entity,
      });
      return {
        total: acc.total + stats.total,
        filled: acc.filled + stats.filled,
      };
    },
    { total: 0, filled: 0 },
  );
};

const getChildEntityCompletionPercent = (
  params: ChildEntityCompletionParams,
): number => toCompletionPercent(getChildEntityCompletionStats(params));

export const RecordCompletion = {
  toCompletionPercent,
  getChildEntityCompletionStats,
  getChildEntityCompletionPercent,
};
