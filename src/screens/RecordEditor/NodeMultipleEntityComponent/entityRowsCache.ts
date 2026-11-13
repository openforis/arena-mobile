import {
  ArenaRecord,
  ArenaRecordNode,
  Dictionary,
  NodeDef,
  Records,
  Survey,
} from "@openforis/arena-core";

import { RecordUtils } from "model/utils/RecordUtils";

export type EntityRow = Dictionary<string> & { key: string; uuid: string };

type CacheEntry = {
  survey: Survey | undefined;
  cycle: string | undefined;
  lang: string;
  t: any;
  summaryDefs: NodeDef<any>[];
  summaryNodes: (ArenaRecordNode | undefined)[];
  summaryValues: any[];
  row: EntityRow;
};

// weak keys: entries are released together with the entity nodes
const cache = new WeakMap<ArenaRecordNode, CacheEntry>();

const sameDefs = (defsA: NodeDef<any>[], defsB: NodeDef<any>[]) =>
  defsA.length === defsB.length &&
  defsA.every((def, index) => def.uuid === defsB[index]!.uuid);

const sameItems = (itemsA: any[], itemsB: any[]) =>
  itemsA.every((item, index) => item === itemsB[index]);

// the summary values of an entity are formatted again only when its summary nodes or the formatting context change
const getEntityRow = ({
  survey,
  record,
  entity,
  lang,
  summaryDefs,
  t,
}: {
  survey: Survey | undefined;
  record: ArenaRecord;
  entity: ArenaRecordNode;
  lang: string;
  summaryDefs: NodeDef<any>[];
  t: any;
}): EntityRow => {
  const { cycle } = record;
  const summaryNodes = summaryDefs.map(
    (summaryDef) => Records.getChildren(entity, summaryDef.uuid)(record)[0],
  );
  const summaryValues = summaryNodes.map((node) => node?.value);

  const cached = cache.get(entity);
  if (
    cached &&
    cached.survey === survey &&
    cached.cycle === cycle &&
    cached.lang === lang &&
    cached.t === t &&
    sameDefs(cached.summaryDefs, summaryDefs) &&
    sameItems(cached.summaryNodes, summaryNodes) &&
    sameItems(cached.summaryValues, summaryValues)
  ) {
    return cached.row;
  }
  const valuesByName = RecordUtils.getEntitySummaryValuesByNameFormatted({
    survey,
    record,
    entity,
    onlyKeys: false,
    lang,
    summaryDefs,
    t,
  });
  const row = {
    key: entity.uuid,
    uuid: entity.uuid,
    ...valuesByName,
  } as EntityRow;
  cache.set(entity, {
    survey,
    cycle,
    lang,
    t,
    summaryDefs,
    summaryNodes,
    summaryValues,
    row,
  });
  return row;
};

export const EntityRowsCache = {
  getEntityRow,
};
